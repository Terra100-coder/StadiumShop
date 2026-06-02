package com.terra.stadiumshopback.controller;

import com.terra.stadiumshopback.dto.TeamRequestDTO;
import com.terra.stadiumshopback.dto.TeamResponseDTO;
import com.terra.stadiumshopback.entity.Team;
import com.terra.stadiumshopback.mapper.TeamMapper;
import com.terra.stadiumshopback.service.TeamService;
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
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final TeamMapper teamMapper;

    @PostMapping
    public ResponseEntity<TeamResponseDTO> create(@RequestBody TeamRequestDTO requestDTO) {
        Team team = teamMapper.toEntity(requestDTO);
        Team createdTeam = teamService.createTeam(team);

        return ResponseEntity.status(HttpStatus.CREATED).body(teamMapper.toResponseDTO(createdTeam));
    }

    @GetMapping
    public ResponseEntity<List<TeamResponseDTO>> getAll() {
        List<TeamResponseDTO> teams = teamService.getAllTeams()
                .stream()
                .map(teamMapper::toResponseDTO)
                .toList();

        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponseDTO> getById(@PathVariable Long id) {
        Team team = teamService.getTeamById(id);

        return ResponseEntity.ok(teamMapper.toResponseDTO(team));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamResponseDTO> update(
            @PathVariable Long id,
            @RequestBody TeamRequestDTO requestDTO
    ) {
        Team team = teamMapper.toEntity(requestDTO);
        Team updatedTeam = teamService.updateTeam(id, team);

        return ResponseEntity.ok(teamMapper.toResponseDTO(updatedTeam));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teamService.deleteTeam(id);

        return ResponseEntity.ok().build();
    }
}
