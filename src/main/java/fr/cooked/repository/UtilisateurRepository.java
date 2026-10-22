package fr.cooked.repository;

import java.util.Optional;

import fr.cooked.bo.Utilisateur;

public interface UtilisateurRepository {
    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    void save(Utilisateur utilisateur);
}
