// Package account deals with the old and (should be)
// depreciated XML file. However, it is "good" in
// the way that it is really easily edited with
// Microsoft Excel, so we'll happily cope with it.
package account

import (
	"log"
	"sync"

	"github.com/beevik/etree"
	"github.com/natsukagami/themis-web-interface/server/expected"
	"github.com/pkg/errors"
)

type xmlAccount struct {
	*Account

	elem *etree.Element // The underlying element.
}

type xmlMap struct {
	mu sync.Mutex
	m  map[string]*xmlAccount

	filename string
	file     *etree.Document
	accounts *etree.Element
}

// Interface assert
var _ = Map((*xmlMap)(nil))

// NewXMLMap creates a new map based on the old-school XML file.
func NewXMLMap(filename string) (Map, error) {
	file := etree.NewDocument()
	if err := file.ReadFromFile(filename); err != nil {
		return nil, errors.Wrap(err, "Đọc file XML")
	}

	// Start parsing the account element and the accounts
	node := file.Root() // Node is the workbook
	// Now find the first worksheet.
	node = node.FindElement("Worksheet")
	if node == nil {
		return nil, errors.New("File XML bị lỗi")
	}
	// Now find the Table
	node = node.FindElement("Table")
	if node == nil {
		return nil, errors.New("File XML bị lỗi")
	}

	m := make(map[string]*xmlAccount)

	// node is now what we call "Table" in the XML
	// Now we find all the Rows and return the accounts
	for id, row := range node.FindElements("Row") {
		if id == 0 {
			// The first row is not an account
			continue
		}
		cells := row.FindElements("Cell/Data")
		if len(cells) < 5 {
			if len(cells) == 0 {
				// Everything is empty, remove?
				node.RemoveChild(row)
				continue
			}
			// Probably missing some fields
			log.Printf("Đọc XML: Dòng %d: Một số trường bị thiếu, bỏ qua.\n", id)
			continue
		}

		acc := &xmlAccount{
			Account: &Account{
				Username: cells[1].Text(),
				Password: cells[2].Text(),
				Name:     cells[3].Text(),
			},
			elem: row,
		}
		hashed := cells[4].Text()

		if acc.Username == "" || acc.Password == "" || acc.Name == "" {
			if acc.Username == "" && acc.Password == "" && acc.Name == "" {
				// Everything is empty, remove?
				node.RemoveChild(row)
				continue
			}
			// Probably missing some fields
			log.Printf("Đọc XML: Dòng %d: Một số trường bị bỏ trống, bỏ qua.\n", id)
			continue
		}
		// Duplicate
		if _, ok := m[acc.Username]; ok {
			log.Printf("Đọc XML: Dòng %d: username bị lặp, bỏ qua.\n", id)
			continue
		}

		if hashed != "1" {
			// ? issue17
			att := cells[2].SelectAttr("ss:Type")
			if att == nil {
				att = cells[2].CreateAttr("ss:Type", "String")
			} else {
				att.Value = "String"
			}
			// We hash the password
			acc.Password = md5Of(acc.Password)
			cells[2].SetText(acc.Password)
			cells[4].SetText("1")
		}

		// Ok, add the account into the map
		m[acc.Username] = acc

		log.Printf("Tài khoản `%s` (%s) đã được thêm.", acc.Username, acc.Name)
	}

	if err := file.WriteToFile(filename); err != nil {
		return nil, errors.Wrap(err, "Re-parse XML")
	}

	return &xmlMap{
		mu:       sync.Mutex{},
		m:        m,
		filename: filename,
		file:     file,
		accounts: node,
	}, nil
}

func (x *xmlMap) write() error {
	return errors.Wrap(x.file.WriteToFile(x.filename), "Ghi file XML")
}

func (x *xmlMap) Create(acc *Account) error {
	x.mu.Lock()
	defer x.mu.Unlock()
	if _, ok := x.m[acc.Username]; ok {
		return ErrUsernameExisted
	}

	// Hash the password
	acc.Password = md5Of(acc.Password)
	// Create a new row
	row := x.accounts.CreateElement("Row")
	row.CreateAttr("ss:AutoFitHeight", "0")
	createData(row, "Number", "0")
	createData(row, "String", acc.Username)
	createData(row, "String", acc.Password)
	createData(row, "String", acc.Name)
	createData(row, "Number", "1")

	// Move it in
	xAcc := &xmlAccount{
		Account: acc,
		elem:    row,
	}
	x.m[acc.Username] = xAcc

	// Write the change
	return errors.Wrap(x.write(), "Tạo tài khoản")
}

func createData(row *etree.Element, dataType, value string) {
	cell := row.CreateElement("Cell")
	cell.CreateAttr("ss:StyleID", "s68")
	data := cell.CreateElement("Data")
	data.CreateAttr("ss:Type", dataType)
	data.SetText(value)
}

func (x *xmlMap) Get(username string) (*Account, error) {
	x.mu.Lock()
	defer x.mu.Unlock()
	xAcc, ok := x.m[username]
	if ok {
		return xAcc.Account, nil
	}
	return nil, nil
}

func (x *xmlMap) Set(chn *Changes) error {
	x.mu.Lock()
	defer x.mu.Unlock()
	xAcc, ok := x.m[chn.Username]
	if !ok {
		return expected.New("User không tồn tại")
	}
	cells := xAcc.elem.FindElements("Cell/Data")

	// Conditionally update each field
	if chn.Password != "" {
		if md5Of(chn.CurrentPassword) != xAcc.Password {
			return expected.New("Mật khẩu cũ không chính xác")
		}
		xAcc.Password = md5Of(chn.Password)
		cells[2].SetText(xAcc.Password)
	}

	return errors.Wrap(x.write(), "Sửa tài khoản")
}

func (x *xmlMap) List() (acc []*Account, err error) {
	x.mu.Lock()
	defer x.mu.Unlock()
	for _, a := range x.m {
		acc = append(acc, a.Account)
	}
	return
}
