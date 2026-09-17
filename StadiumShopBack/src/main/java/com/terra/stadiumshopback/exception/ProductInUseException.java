package com.terra.stadiumshopback.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ProductInUseException extends RuntimeException {

    public ProductInUseException(String message) {
        super(message);
    }
}
