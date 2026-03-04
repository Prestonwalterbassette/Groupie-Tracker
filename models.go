package main

import "gorm.io/gorm"

type Favorite struct {
	gorm.Model
	ArtistName string 
	ArtistID  string
}