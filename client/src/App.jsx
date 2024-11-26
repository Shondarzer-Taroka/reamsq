
import './App.css'; // Importing the CSS file for styling
import axios from "axios";
import { useEffect, useState } from "react";

const App = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        age: '',
        address: {
            city: '',
            house: ''
        }
    });
    const [editMode, setEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    // Fetch users from the backend
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_baseurl}/users`)
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the users!', error);
            });
    }, []);

    // Add a new user
    const handleAddUser = (e) => {
        e.preventDefault();

        const preparedUser = {
            ...newUser,
            age: Number(newUser.age), // Convert age to a number
        };

        if (editMode) {
            // Update user logic
            axios.put(`${import.meta.env.VITE_baseurl}/users/${editingUserId}`, preparedUser)
                .then(() => {
                    setUsers(users.map(user => user.id === editingUserId ? { ...user, ...preparedUser } : user));
                    setNewUser({
                        name: '',
                        email: '',
                        age: '',
                        address: { city: '', house: '' }
                    });
                    setEditMode(false);
                    setEditingUserId(null);
                })
                .catch(error => {
                    console.error('There was an error updating the user!', error);
                });
        } else {
            // Add user logic
            axios.post(`${import.meta.env.VITE_baseurl}/users`, preparedUser)
                .then(response => {
                    setUsers([...users, response.data]);
                    setNewUser({
                        name: '',
                        email: '',
                        age: '',
                        address: { city: '', house: '' }
                    });
                })
                .catch(error => {
                    console.error('There was an error adding the user!', error);
                });
        }
    };

    const handleEditUser = (user) => {
        setNewUser(user);
        setEditMode(true);
        setEditingUserId(user.id);
    };

    const handleDeleteUser = (userId) => {
        axios.delete(`${import.meta.env.VITE_baseurl}/users/${userId}`)
            .then(() => {
                setUsers(users.filter(user => user.id !== userId));
            })
            .catch(error => {
                console.error('There was an error deleting the user!', error);
            });
    };


    return (
        <section style={{ display: 'flex', gap: "2rem", width: '100%' }}>
            <div className="container">
                <h1>Users</h1>
                <form className="form" onSubmit={handleAddUser}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            required
                            placeholder="Name"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            required
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Age</label>
                        <input
                            type="number"
                            placeholder="Age"
                            value={newUser.age}
                            onChange={(e) => setNewUser({ ...newUser, age: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            placeholder="City"
                            value={newUser.address.city}
                            onChange={(e) => setNewUser({ ...newUser, address: { ...newUser.address, city: e.target.value } })}
                        />
                    </div>
                    <div className="form-group">
                        <label>House</label>
                        <input
                            type="text"
                            placeholder="House"
                            value={newUser.address.house}
                            onChange={(e) => setNewUser({ ...newUser, address: { ...newUser.address, house: e.target.value } })}
                        />
                    </div>
                    <button className="submit-btn" type="submit">
                        {editMode ? 'Update User' : 'Add User'}
                    </button>
                </form>
            </div>

            <div>
                <h2>All Users</h2>
                <ul className="user-list">
                    {users.map((user) => (
                        <li key={user.id}>
                            <div>
                                <strong>{user.name}</strong> - {user.email} - {user.age} - {user.address.city}, {user.address.house}
                            </div>
                            <div>
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEditUser(user)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDeleteUser(user.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

        </section>
    );
};

export default App;
