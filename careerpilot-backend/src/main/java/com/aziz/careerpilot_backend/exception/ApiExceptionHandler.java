package com.aziz.careerpilot_backend.exception;


import org.springframework.context.support.DefaultMessageSourceResolvable;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<Map<String, Object>>
    handleValidation(
            MethodArgumentNotValidException exception
    ) {
        List<String> errors =
                exception
                        .getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(
                                DefaultMessageSourceResolvable
                                        ::getDefaultMessage
                        )
                        .distinct()
                        .toList();

        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(
                "timestamp",
                LocalDateTime.now()
        );

        body.put("status", 400);

        body.put(
                "message",
                "Données invalides"
        );

        body.put(
                "errors",
                errors
        );

        return ResponseEntity
                .badRequest()
                .body(body);
    }

    @ExceptionHandler(
            ResponseStatusException.class
    )
    public ResponseEntity<Map<String, Object>>
    handleResponseStatus(
            ResponseStatusException exception
    ) {
        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(
                "timestamp",
                LocalDateTime.now()
        );

        body.put(
                "status",
                exception
                        .getStatusCode()
                        .value()
        );

        body.put(
                "message",
                exception.getReason()
        );

        return ResponseEntity
                .status(
                        exception.getStatusCode()
                )
                .body(body);
    }
}