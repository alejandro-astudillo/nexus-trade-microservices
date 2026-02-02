package config

import (
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	ServerPort  string `mapstructure:"SERVER_PORT"`
	RedisAddr   string `mapstructure:"REDIS_ADDR"`
	RabbitMQURL string `mapstructure:"RABBITMQ_URL"`
}

func Load() (*Config, error) {
	viper.AutomaticEnv()
	// Replace dot with underscore in env vars if needed, though mostly standard
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	// Set defaults
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("REDIS_ADDR", "localhost:6379")
	viper.SetDefault("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
