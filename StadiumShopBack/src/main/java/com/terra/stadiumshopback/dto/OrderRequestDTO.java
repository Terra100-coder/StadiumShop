package com.terra.stadiumshopback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDTO {

    private String customerName;

    private String phone;

    private String email;

    private String address;

    private String city;

    private List<OrderItemRequestDTO> items;
}
