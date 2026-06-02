package com.terra.stadiumshopback.service;

import com.terra.stadiumshopback.entity.Team;
import com.terra.stadiumshopback.exception.ResourceNotFoundException;
import com.terra.stadiumshopback.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;

    public Team createTeam(Team team) {
        team.setId(null);

        return teamRepository.save(team);
    }

    @Transactional(readOnly = true)
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Team getTeamById(Long id) {
        return getTeamOrThrow(id);
    }

    public Team updateTeam(Long id, Team team) {
        Team existingTeam = getTeamOrThrow(id);

        existingTeam.setName(team.getName());
        existingTeam.setType(team.getType());
        existingTeam.setCountry(team.getCountry());

        return teamRepository.save(existingTeam);
    }

    public void deleteTeam(Long id) {
        Team team = getTeamOrThrow(id);
        teamRepository.delete(team);
    }

    private Team getTeamOrThrow(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
    }
}
