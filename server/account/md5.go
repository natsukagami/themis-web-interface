package account

import (
	"crypto/md5"
	"encoding/hex"
)

func md5Of(x string) string {
	sum := md5.New()
	sum.Write([]byte(x))
	return hex.EncodeToString(sum.Sum(nil))
}
