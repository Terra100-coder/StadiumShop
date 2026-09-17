package com.terra.stadiumshopback.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProductRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 150, message = "Le nom ne doit pas dépasser 150 caractères")
    private String name;

    private String description;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être strictement positif")
    private BigDecimal price;

    @Positive(message = "Le prix promotionnel doit être strictement positif")
    private BigDecimal promoPrice;

    @NotBlank(message = "L'image principale est obligatoire")
    private String mainImage;

    @Builder.Default
    private List<@NotBlank(message = "Une URL de galerie ne peut pas être vide") String> gallery = new ArrayList<>();

    private boolean personalizable;

    private Boolean active;

    @NotNull(message = "La catégorie est obligatoire")
    private Long categoryId;

    @NotNull(message = "L'équipe est obligatoire")
    private Long teamId;

    @Valid
    @Builder.Default
    private List<AdminProductStockRequestDTO> stock = new ArrayList<>();
}
