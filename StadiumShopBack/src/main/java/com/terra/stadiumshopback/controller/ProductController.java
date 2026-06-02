package com.terra.stadiumshopback.controller;

import com.terra.stadiumshopback.dto.ProductRequestDTO;
import com.terra.stadiumshopback.dto.ProductResponseDTO;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.mapper.ProductMapper;
import com.terra.stadiumshopback.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductMapper productMapper;

    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@RequestBody ProductRequestDTO requestDTO) {
        Product product = productMapper.toEntity(requestDTO);
        Product createdProduct = productService.createProduct(product, requestDTO.getCategoryId(), requestDTO.getTeamId());

        return ResponseEntity.status(HttpStatus.CREATED).body(productMapper.toResponseDTO(createdProduct));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(
            @PathVariable Long id,
            @RequestBody ProductRequestDTO requestDTO
    ) {
        Product product = productMapper.toEntity(requestDTO);
        Product updatedProduct = productService.updateProduct(
                id,
                product,
                requestDTO.getCategoryId(),
                requestDTO.getTeamId()
        );

        return ResponseEntity.ok(productMapper.toResponseDTO(updatedProduct));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.deleteProduct(id);

        return ResponseEntity.ok().build();
    }
}
