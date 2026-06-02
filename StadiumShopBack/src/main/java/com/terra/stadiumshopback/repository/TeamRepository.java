package com.terra.stadiumshopback.repository;

import com.terra.stadiumshopback.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {
}
