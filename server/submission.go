package server

// Some predefined save statuses.
const (
	StatusSaved     = "saved"
	StatusSubmitted = "submitted"
)

// Maps the languages to its extension.
var languageMap = map[string]string{
	"C++":    ".cpp",
	"Pascal": ".pas",
	"Python": ".py",
	"Java":   ".java",
}

// Submission represents a Submission.
// It will completely match the old version's
// type interface.
type Submission struct {
	// ID         string `json:"id"` // We actually ignore this, it's just for future-proof
	Filename   string `json:"filename"`
	Language   string `json:"ext"` // File language
	Content    string `json:"content"`
	SaveStatus string `json:"saveStatus"`
}

// Name returns the fully-qualified name of the
// submission.
func (s *Submission) Name() string {
	return s.Filename + languageMap[s.Language]
}
