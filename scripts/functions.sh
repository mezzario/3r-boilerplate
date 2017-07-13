#!/bin/bash

function message {
  printf "$(tput setaf 2)$1$(tput sgr0)"
}

function error {
  printf "$(tput setaf 1)$1$(tput sgr0)"
}
