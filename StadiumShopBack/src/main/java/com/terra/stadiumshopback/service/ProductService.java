package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.dto.ProductResponseDTO;
import com.terra.stadiumshopback.entity.Category;
import com.terra.stadiumshopback.entity.Product;
import com.terra.stadiumshopback.entity.StockSize;
import com.terra.stadiumshopback.entity.Team;
import com.terra.stadiumshopback.exception.ResourceNotFoundException;
import com.terra.stadiumshopback.mapper.ProductMapper;
import com.terra.stadiumshopback.repository.CategoryRepository;
import com.terra.stadiumshopback.repository.ProductRepository;
import com.terra.stadiumshopback.repository.StockSizeRepository;
import com.terra.stadiumshopback.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final TeamRepository teamRepository;
    private final StockSizeRepository stockSizeRepository;
    private final ProductMapper productMapper;

    public Product createProduct(Product product, Long categoryId, Long teamId) {
        Category category = getCategoryOrThrow(categoryId);
        Team team = getTeamOrThrow(teamId);

        product.setId(null);
        product.setCategory(category);
        product.setTeam(team);
        ensureGallery(product);

        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponseDTOWithStock)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        return toResponseDTOWithStock(getProductOrThrow(id));
    }

    public Product updateProduct(Long id, Product product, Long categoryId, Long teamId) {
        Product existingProduct = getProductOrThrow(id);
        Category category = getCategoryOrThrow(categoryId);
        Team team = getTeamOrThrow(teamId);

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setPromoPrice(product.getPromoPrice());
        existingProduct.setMainImage(product.getMainImage());
        existingProduct.setGallery(product.getGallery() == null ? new ArrayList<>() : product.getGallery());
        existingProduct.setPersonalizable(product.isPersonalizable());
        existingProduct.setActive(product.isActive());
        existingProduct.setCategory(category);
        existingProduct.setTeam(team);

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        Product product = getProductOrThrow(id);
        productRepository.delete(product);
    }

    private Product getProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private Category getCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private Team getTeamOrThrow(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
    }

    private ProductResponseDTO toResponseDTOWithStock(Product product) {
        List<StockSize> stockSizes = stockSizeRepository.findByProductId(product.getId());

        return productMapper.toResponseDTO(product, stockSizes);
    }

    private void ensureGallery(Product product) {
        if (product.getGallery() == null) {
            product.setGallery(new ArrayList<>());
        }
    }
}
