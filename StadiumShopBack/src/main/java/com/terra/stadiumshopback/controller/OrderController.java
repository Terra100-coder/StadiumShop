package com.terra.stadiumshopback.controller;

import com.terra.stadiumshopback.dto.OrderRequestDTO;
import com.terra.stadiumshopback.dto.OrderResponseDTO;
import com.terra.stadiumshopback.entity.Order;
import com.terra.stadiumshopback.mapper.OrderMapper;
import com.terra.stadiumshopback.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> create(@RequestBody OrderRequestDTO requestDTO) {
        Order order = orderMapper.toEntity(requestDTO);
        Order createdOrder = orderService.createOrder(order);

        return ResponseEntity.status(HttpStatus.CREATED).body(orderMapper.toResponseDTO(createdOrder));
    }
}
