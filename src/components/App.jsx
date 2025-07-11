import { useState } from "react";
import "../styles/App.scss";
import usersData from "../data/users.json";
import { useEffect } from "react";

function App() {
  //VARIABLES DE ESTADO

  //Estado para manejar mensajes de error
  const [errorMessage, setErrorMessage] = useState("");

  //Estado para controlar si el formulario es visible o no
  const [isVisible, setisVisible] = useState(false);

  //Estado para guardar el valor del los inputs del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ciudad: "",
  });

  // Estado para la lista de usuarios
  // Se inicializa leyendo de localStorage o con los datos por defecto
  // Si hay un error al leer localStorage, se usa usersData como valor por defecto
  const [usersList, setUsersList] = useState(() => {
    try {
      const storedUsers = localStorage.getItem("usersList");
      return storedUsers ? JSON.parse(storedUsers) : usersData;
    } catch (error) {
      console.error("Error al leer usersList del localStorage:", error);
      return usersData;
    }
  });

  // 2. Luego guarda automáticamente cada vez que cambia usersList
  useEffect(() => {
    try {
      localStorage.setItem("usersList", JSON.stringify(usersList));
    } catch (error) {
      console.error("Error al guardar usersList en localStorage:", error);
    }
  }, [usersList]);

  console.log("lista de usuarios:", usersList);

  // Estado para el texto que el usuario escribe en el campo de búsqueda
  const [searchName, setSearchName] = useState("");

  // Estado para almacenar los IDs de los usuarios favoritos
  // Se inicializa leyendo de localStorage
  const [favoriteUserIds, setFavoriteUserIds] = useState(() => {
    try {
      const storedFavorites = localStorage.getItem("favoriteUsers");
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Error al leer favoritos de localStorage:", error);
      return [];
    }
  });
  console.log("id de favoritos:", favoriteUserIds);

  // Función para manejar el envío del formulario
  const handleAddUser = (event) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.ciudad) {
      setErrorMessage("Por favor, completa todos los campos del formulario.");
    }
    const newuser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      ciudad: formData.ciudad,
    };

    setUsersList((prevUsers) => [...prevUsers, newuser]);
    setFormData({
      name: "",
      email: "",
      ciudad: "",
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  console.log("formdata:", formData);

  // Función para manejar el cambio en el input de búsqueda
  const handleinput = (event) => {
    const value = event.target.value;
    setSearchName(value); // Actualiza el estado 'searchName'
  };

  // Función para marcar/desmarcar un usuario como favorito
  const handleToggleFavorite = (userId) => {
    let updatedFavorites;
    if (favoriteUserIds.includes(userId)) {
      // Si ya es favorito, lo quitamos
      updatedFavorites = favoriteUserIds.filter((id) => id !== userId);
    } else {
      // Si no es favorito, lo añadimos
      updatedFavorites = [...favoriteUserIds, userId];
    }
    setFavoriteUserIds(updatedFavorites);
    // Persistir en localStorage
    localStorage.setItem("favoriteUsers", JSON.stringify(updatedFavorites));
  };

  const handleDeleteUser = (userId) => {
    const updatedUsers = usersList.filter((user) => user.id !== userId);
    setUsersList(updatedUsers);

    // También eliminar de favoritos si lo era
    if (favoriteUserIds.includes(userId)) {
      const updatedFavorites = favoriteUserIds.filter((id) => id !== userId);
      setFavoriteUserIds(updatedFavorites);
      localStorage.setItem("favoriteUsers", JSON.stringify(updatedFavorites));
    }
  };

  // Calculamos la lista filtrada directamente en cada renderizado

  const filteredUsers = usersList.filter((user) =>
    user.name.toLocaleLowerCase().includes(searchName.toLocaleLowerCase())
  );

  console.log("Usuarios filtrados:", filteredUsers);
  console.log("IDs de favoritos:", favoriteUserIds);

  const favoriteUsers = usersList.filter((user) =>
    favoriteUserIds.includes(user.id)
  );

  console.log("usuarios favoritos", favoriteUsers);

  return (
    <>
      <button
        className="button-visible"
        onClick={() => setisVisible(!isVisible)}
      >
        {isVisible ? "Ocultar formulario" : "Añadir contacto"}
      </button>
      {isVisible && (
        <form className="form-container" onSubmit={handleAddUser}>
          <label>Nombre:</label>
          <input
            type="text"
            placeholder="Nombre"
            onChange={handleFormChange}
            value={formData.name}
            name="name"
          />
          <label>Email:</label>
          <input
            type="text"
            placeholder="Email"
            onChange={handleFormChange}
            value={formData.email}
            name="email"
          />
          <label>ciudad:</label>
          <input
            type="text"
            placeholder="ciudad"
            onChange={handleFormChange}
            value={formData.ciudad}
            name="ciudad"
          />

          <button type="submit" className="add-button">
            Añadir contacto
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      )}
      <div className="search-container">
        <label htmlFor="userNameInput" className="search-label">
          Nombre de contacto
        </label>
        <input
          id="userNameInput"
          onChange={handleinput}
          type="text"
          placeholder="buscar por nombre..."
          value={searchName}
          className="search-input"
        />
      </div>{" "}
      <p className="favorites-counter">
        Usuarios favoritos: {favoriteUserIds.length}
      </p>
      <h1 className="section-title">Lista de contactos </h1>
      <div className="user-grid-container">
        {filteredUsers.length === 0 ? (
          <p className="no-users-message">
            No se encontraron contactos que coincidan con tus criterios de
            búsqueda
          </p>
        ) : (
          <ul className="user-list-grid">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className={`user-card ${
                  favoriteUserIds.includes(user.id) ? "favorite" : ""
                }`}
              >
                <p className="user-name">Nombre: {user.name}</p>
                <p className="user-email">Email: {user.email}</p>
                <p className="user-city">Ciudad: {user.ciudad}</p>
                <button
                  onClick={() => handleToggleFavorite(user.id)}
                  className="favorite-button"
                >
                  {favoriteUserIds.includes(user.id) ? "⭐ Quitar" : "☆ Añadir"}
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="remove-button"
                >
                  🗑️ Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="user-grid-container">
        <h1 className="section-title">Lista de favoritos </h1>
        <ul className="user-list-grid">
          {favoriteUsers.length === 0 ? (
            <p className="no-users-message">No hay contactos favoritos </p>
          ) : (
            favoriteUsers.map((user) => (
              <li key={user.id} className="user-card favorite">
                <p className="user-name">Nombre: {user.name}</p>
                <p className="user-email">Email: {user.email}</p>
                <p className="user-city">Ciudad: {user.ciudad}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}

export default App;
