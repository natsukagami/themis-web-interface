package account_test

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"os"
	"testing"

	"github.com/natsukagami/themis-web-interface/server/account"
	"github.com/pkg/errors"
)

const testFile = "account.fixed.xml"

func clone(newFile string) error {
	read, err := os.Open(testFile)
	if err != nil {
		return errors.WithStack(err)
	}
	defer read.Close()
	write, err := os.Create(newFile)
	if err != nil {
		return errors.WithStack(err)
	}
	defer write.Close()
	if _, err := io.Copy(write, read); err != nil {
		return errors.WithStack(err)
	}
	return nil
}

func TestLoadFileIntact(T *testing.T) {
	const intact = "intact.xml"
	if err := clone(intact); err != nil {
		T.Fatal(err)
	}
	defer os.Remove(intact)
	// Load the file in
	if acc, err := account.NewXMLMap(intact); err != nil {
		T.Fatal(err)
	} else {
		if list, err := acc.List(); err != nil {
			T.Fatal(err)
		} else if len(list) != 3 {
			T.Fatalf("Expected 3 accounts, got %#v\n", list)
		}
	}
	// Reload the file!
	if acc, err := account.NewXMLMap(intact); err != nil {
		T.Fatal(err)
	} else {
		if list, err := acc.List(); err != nil {
			T.Fatal(err)
		} else if len(list) != 3 {
			T.Fatalf("Expected 3 accounts, got %#v\n", list)
		}
	}
}

func TestLoadBrokenFile(T *testing.T) {
	// Should not load a broken file
	if _, err := account.NewXMLMap("account.broken.xml"); err == nil {
		T.Fatal("Expected error, got nil")
	}
}

func md5Of(x string) string {
	sum := md5.New()
	sum.Write([]byte(x))
	return hex.EncodeToString(sum.Sum(nil))
}

func TestCreateUser(T *testing.T) {
	// Should create a new user
	const create = "create.xml"
	if err := clone(create); err != nil {
		T.Fatal(err)
	}
	defer os.Remove(create)

	jiry := &account.Account{
		Username: "$Jiry",
		Password: "anything",
		Name:     "Real Jiry",
	}

	if acc, err := account.NewXMLMap(create); err != nil {
		T.Fatal(err)
	} else {
		// Should reject creating duplicate account
		if err := acc.Create(&account.Account{
			Username: "$Jury",
			Password: "anything",
			Name:     "Fake Jury",
		}); err == nil {
			T.Fatal("Expected error got nil")
		}

		anythingHash := md5Of("anything")

		// Should successfully create
		if err := acc.Create(jiry); err != nil {
			T.Fatal(err)
		}

		// Should be query-able
		if u, err := acc.Get("$Jiry"); err != nil {
			T.Fatal(err)
		} else if u == nil {
			T.Fatal("Expected Jiry got nil")
		} else if anythingHash != u.Password {
			T.Fatal("Expected hashed `anything` got " + u.Password)
		}
	}

	// Reload and we should still get the same thing
	if acc, err := account.NewXMLMap(create); err != nil {
		T.Fatal(err)
	} else {
		if u, err := acc.Get("$Jiry"); err != nil {
			T.Fatal(err)
		} else if u == nil {
			T.Fatal("Expected Jiry got nil")
		} else if *jiry != *u {
			T.Fatalf("Expected %#v, got %#v\n", *jiry, *u)
		}
	}
}

func TestGetUser(T *testing.T) {
	const query = "query.xml"
	if err := clone(query); err != nil {
		T.Fatal(err)
	}
	defer os.Remove(query)

	if acc, err := account.NewXMLMap(query); err != nil {
		T.Fatal(err)
	} else {
		accounts := []account.Account{
			account.Account{
				Username: "$Jury",
				Password: "92eb5ffee6ae2fec3ad71c777531578f",
				Name:     "Ban Giám Khảo",
			},
			account.Account{
				Username: "Nguyen Van A",
				Password: md5Of("a"),
				Name:     "Nguyễn Văn A",
			},
			account.Account{
				Username: "Tran Thi C",
				Password: md5Of("rghi3gh3409gh340gh34g4g3gb34gi34gb"),
				Name:     "Trần Thị C",
			},
		}

		// Should find all the accounts
		for _, a := range accounts {
			if u, err := acc.Get(a.Username); err != nil {
				T.Fatal(a, err)
			} else if u == nil {
				T.Fatalf("Expected %#v got nil\n", a)
			} else if a != *u {
				T.Fatalf("Expected %#v got %#v\n", a, *u)
			}
		}

		// Should find an non existing account
		if u, err := acc.Get("Jiry"); err != nil {
			T.Fatal(err)
		} else if u != nil {
			T.Fatalf("Expect nil got %#v\n", *u)
		}
	}
}

func TestSetUser(T *testing.T) {
	const query = "query2.xml"
	if err := clone(query); err != nil {
		T.Fatal(err)
	}
	defer os.Remove(query)

	var juryAcc account.Account

	if acc, err := account.NewXMLMap(query); err != nil {
		T.Fatal(err)
	} else {
		// Should not be able to change a non-existing user
		if err := acc.Set(&account.Changes{
			Username:        "$Jiry",
			CurrentPassword: "b",
			Password:        "c",
		}); err == nil {
			T.Fatal("Expected error, got nil")
		}

		jury, err := acc.Get("$Jury")
		if err != nil {
			T.Fatal(err)
		}
		juryAcc = *jury // Reference struct

		// Should handle an empty change
		if err := acc.Set(&account.Changes{
			Username: jury.Username,
			Password: "",
		}); err != nil {
			T.Fatal(err)
		} else {
			if u, err := acc.Get(jury.Username); err != nil {
				T.Fatal(err)
			} else if u == nil {
				T.Fatalf("Expected %#v got nil\n", juryAcc)
			} else if juryAcc != *u {
				T.Fatalf("Expected %#v got %#v\n", juryAcc, *u)
			}
		}

		// Should handle password change with invalid current password
		if err := acc.Set(&account.Changes{
			Username:        jury.Username,
			Password:        "c",
			CurrentPassword: "a",
		}); err == nil {
			T.Fatal("Expected error got nil")
		}

		// Should handle valid change
		if err := acc.Set(&account.Changes{
			Username:        jury.Username,
			Password:        "c",
			CurrentPassword: "b",
		}); err != nil {
			T.Fatal(err)
		} else {
			juryAcc.Password = md5Of("c")
			if u, err := acc.Get(jury.Username); err != nil {
				T.Fatal(err)
			} else if u == nil {
				T.Fatalf("Expected %#v got nil\n", juryAcc)
			} else if juryAcc != *u {
				T.Fatalf("Expected %#v got %#v\n", juryAcc, *u)
			}
		}
	}

	// Now reload, changes should stay the same.
	if acc, err := account.NewXMLMap(query); err != nil {
		T.Fatal(err)
	} else {
		if u, err := acc.Get(juryAcc.Username); err != nil {
			T.Fatal(err)
		} else if u == nil {
			T.Fatalf("Expected %#v got nil\n", juryAcc)
		} else if juryAcc != *u {
			T.Fatalf("Expected %#v got %#v\n", juryAcc, *u)
		}
	}
}
