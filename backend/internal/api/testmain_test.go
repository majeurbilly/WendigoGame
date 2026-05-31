package api_test

import (
	"os"
	"testing"
)

func TestMain(m *testing.M) {
	_ = os.Setenv("WENDIGO_AUTH_TEST_MODE", "1")
	os.Exit(m.Run())
}
