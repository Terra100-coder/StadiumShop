package com.terra.stadiumshopback.controller;

import com.terra.stadiumshopback.dto.OrderResponseDTO;
import com.terra.stadiumshopback.dto.OrderStatusUpdateRequestDTO;
import com.terra.stadiumshopback.mapper.OrderMapper;
import com.terra.stadiumshopback.service.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;
    private final OrderMapper orderMapper;

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAll() {
        List<OrderResponseDTO> orders = adminOrderService.getAllOrders()
                .stream()
                .map(orderMapper::toResponseDTO)
                .toList();

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderMapper.toResponseDTO(adminOrderService.getOrderById(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(orderMapper.toResponseDTO(
                adminOrderService.updateOrderStatus(id, requestDTO.getStatus())
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminOrderService.deleteOrder(id);

        return ResponseEntity.ok().build();
    }
}
