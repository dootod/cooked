CREATE TABLE Recettes
(
	idRecette INT IDENTITY(1, 1) NOT NULL,
	libelle NVARCHAR(100) NOT NULL,
	temps INT NOT NULL,
	difficulte NVARCHAR(30) NOT NULL,
	nbPersonne INT NOT NULL,
	dateCreation DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

	CONSTRAINT PK_Recettes PRIMARY KEY (idRecette),
	CONSTRAINT UK_Recettes_libelle UNIQUE (libelle),
	CONSTRAINT CK_Recettes_Temps CHECK (temps >= 0),
	CONSTRAINT CK_Recettes_Difficulte CHECK (difficulte IN ('Facile', 'Intermédiaire', 'Difficile')),
	CONSTRAINT CK_Recettes_nbPersonne CHECK (nbPersonne > 0)
)

CREATE TABLE Ingredients 
(
	idIngredient INT IDENTITY(1, 1) NOT NULL,
	libelle NVARCHAR(100) NOT NULL,
	unite NVARCHAR(30) NOT NULL,

	CONSTRAINT PK_Ingredients PRIMARY KEY (idIngredient),
	CONSTRAINT CK_Ingredients_Unite CHECK (unite IN ('g', 'kg', 'mg', 'ml', 'cl', 'l', 'pièce', 'gousse', 
	'tranche', 'feuille', 'branche', 'sachet', 'boîte', 'pot', 'verre', 'tasse', 'cuillère à café', 
	'cuillère à soupe', 'pincée')),
	CONSTRAINT UK_Ingredients_Libelle UNIQUE (libelle)
)

CREATE TABLE RecettesIngredients
(
	idRecette INT NOT NULL,
	idIngredient INT NOT NULL,
	quantite DECIMAL(10, 3) NOT NULL,

	CONSTRAINT PK_RecettesIngredients PRIMARY KEY (idRecette, idIngredient),
	CONSTRAINT FK_RecettesIngredients_Recettes FOREIGN KEY (idRecette) REFERENCES Recettes(idRecette) ON DELETE CASCADE,
	CONSTRAINT FK_RecettesIngredients_Ingredients FOREIGN KEY (idIngredient) REFERENCES Ingredients(idIngredient),
	CONSTRAINT CK_RecettesIngredients_Quantite CHECK (quantite > 0)
)

CREATE TABLE RecettesEtapes
(
	idEtape INT IDENTITY(1, 1) NOT NULL,
	numero INT NOT NULL,
	description NVARCHAR(MAX) NOT NULL,
	idRecette INT NOT NULL,

	CONSTRAINT PK_RecettesEtapes PRIMARY KEY (idEtape),
	CONSTRAINT CK_RecettesEtapes_Numero CHECK (numero > 0),
	CONSTRAINT FK_RecettesEtapes_Recettes FOREIGN KEY (idRecette) REFERENCES Recettes(idRecette) ON DELETE CASCADE,
	CONSTRAINT UK_RecettesEtapes_Numero_IdRecette UNIQUE (numero, idRecette)
)

CREATE TABLE Utilisateurs
(
	idUtilisateur INT IDENTITY(1, 1) NOT NULL,
	nom NVARCHAR(100) NOT NULL,
	prenom NVARCHAR(100) NOT NULL,
	email NVARCHAR(254) NOT NULL,
	motDePasse NVARCHAR(255) NOT NULL,
	role NVARCHAR(30) NOT NULL DEFAULT 'USER',
	dateCreation DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

	CONSTRAINT PK_Utilisateurs PRIMARY KEY (idUtilisateur),
	CONSTRAINT UK_Utilisateurs_Email UNIQUE (email),
	CONSTRAINT CK_Utilisateurs_Role CHECK (role IN ('USER', 'ADMIN'))
)