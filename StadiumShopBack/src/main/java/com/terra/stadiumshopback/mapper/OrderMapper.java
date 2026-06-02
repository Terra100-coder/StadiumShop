package com.terra.stadiumshopback.mapper;

import com.terra.stadiumshopback.dto.OrderItemRequestDTO;
import com.terra.stadiumshopback.dto.OrderRequestDTO;
import com.terra.stadiumshopback.dto.OrderResponseDTO;
import com.terra.stadiumshopback.entity.Order;
import com.terra.stadiumshopback.entity.OrderItem;
import com.terra.stadiumshopback.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public Order toEntity(OrderRequestDTO requestDTO) {
        Order order = Order.builder()
                .customerName(requestDTO.getCustomerName())
                .phone(requestDTO.getPhone())
                .email(requestDTO.getEmail())
                .address(requestDTO.getAddress())
                .city(requestDTO.getCity())
                .build();

        if (requestDTO.getItems() != null) {
            requestDTO.getItems()
                    .stream()
                    .map(this::toOrderItem)
                    .forEach(order::addItem);
        }

        return order;
    }

    public OrderResponseDTO toResponseDTO(Order order) {
        return OrderResponseDTO.builder()
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItem toOrderItem(OrderItemRequestDTO requestDTO) {
        Product product = Product.builder()
                .id(requestDTO.getProductId())
                .build();

        return OrderItem.builder()
                .product(product)
                .size(requestDTO.getSize())
                .quantity(requestDTO.getQuantity())
                .personalizationName(requestDTO.getPersonalizationName())
                .personalizationNumber(requestDTO.getPersonalizationNumber())
                .build();
    }
}
