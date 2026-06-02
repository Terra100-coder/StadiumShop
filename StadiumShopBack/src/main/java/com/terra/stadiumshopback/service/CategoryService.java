package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.entity.Category;
import com.terra.stadiumshopback.exception.DuplicateResourceException;
import com.terra.stadiumshopback.exception.ResourceNotFoundException;
import com.terra.stadiumshopback.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public Category createCategory(Category category) {
        ensureSlugIsUnique(category.getSlug());
        category.setId(null);

        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return getCategoryOrThrow(id);
    }

    public Category updateCategory(Long id, Category category) {
        Category existingCategory = getCategoryOrThrow(id);
        ensureSlugIsUniqueForUpdate(category.getSlug(), id);

        existingCategory.setName(category.getName());
        existingCategory.setSlug(category.getSlug());

        return categoryRepository.save(existingCategory);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryOrThrow(id);
        categoryRepository.delete(category);
    }

    private Category getCategoryOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private void ensureSlugIsUnique(String slug) {
        if (categoryRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("Category slug already exists: " + slug);
        }
    }

    private void ensureSlugIsUniqueForUpdate(String slug, Long categoryId) {
        categoryRepository.findBySlug(slug)
                .filter(category -> !category.getId().equals(categoryId))
                .ifPresent(category -> {
                    throw new DuplicateResourceException("Category slug already exists: " + slug);
                });
    }
}
