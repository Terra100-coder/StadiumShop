package com.terra.stadiumshopback.controller;

import com.terra.stadiumshopback.dto.ProductResponseDTO;
import com.terra.stadiumshopback.dto.StockSizeResponseDTO;
import com.terra.stadiumshopback.dto.StockUpdateRequestDTO;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.mapper.ProductMapper;
import com.terra.stadiumshopback.service.AdminProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;
    private final ProductMapper productMapper;

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ProductResponseDTO> activate(@PathVariable Long id) {
        Product product = adminProductService.activateProduct(id);

        return ResponseEntity.ok(productMapper.toResponseDTO(product));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ProductResponseDTO> deactivate(@PathVariable Long id) {
        Product product = adminProductService.deactivateProduct(id);

        return ResponseEntity.ok(productMapper.toResponseDTO(product));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<StockSizeResponseDTO> updateStock(
            @PathVariable Long id,
            @RequestBody StockUpdateRequestDTO requestDTO
    ) {
        StockSize stockSize = adminProductService.updateStock(id, requestDTO.getSize(), requestDTO.getQuantity());

        return ResponseEntity.ok(StockSizeResponseDTO.builder()
                .size(stockSize.getSize())
                .quantity(stockSize.getQuantity())
                .build());
    }
}
