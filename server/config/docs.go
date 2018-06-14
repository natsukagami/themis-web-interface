// Package config provides a mean of configuration for the server.
//
// The config is saved in TOML format, by the beautifully written
// https://github.com/BurntSushi/toml library.
//
// It is recommended to pass the whole configuration struct and
// query each configuration every time. This way, every change to
// the configuration will be spotted.
package config
