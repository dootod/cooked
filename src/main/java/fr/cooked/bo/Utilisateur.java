package fr.cooked.bo;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class Utilisateur {
    private int idUtilisateur;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "La taille maximum d'un nom est de 100 char")
    private String nom;

    @NotBlank(message = "Le prenom est obligatoire")
    @Size(max = 100, message = "La taille maximum d'un prenom est de 100 char")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Size(max = 254, message = "La taille maximum d'un email est de 254 char")
    @Email(message = "L'email n'est pas valide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(max = 255, message = "La taille maximum d'un mot de passe est de 255 char")
    private String motDePasse;

    @Size(max = 30, message = "La taille maximum d'un rôle est de 30 char")
    @Pattern(regexp = "USER|ADMIN", message = "Le rôle doit être USER ou ADMIN")
    private String role;

    private LocalDateTime dateCreation;

    public int getIdUtilisateur() {
        return idUtilisateur;
    }

    public void setIdUtilisateur(int idUtilisateur) {
        this.idUtilisateur = idUtilisateur;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
