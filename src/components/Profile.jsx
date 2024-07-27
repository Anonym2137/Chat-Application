import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import axios from "axios";

const Profile = ({ token, currentUser, onProfileUpdate }) => {
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(currentUser.email);
  const [name, setName] = useState(currentUser.name);
  const [surname, setSurname] = useState(currentUser.surname);
  const [note, setNote] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(currentUser.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/profile/${currentUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const { username, email, name, surname, note, avatar } = response.data;
        setUsername(username);
        setEmail(email);
        setName(name);
        setSurname(surname);
        setNote(note || '');
        setPreview(avatar || '');
      }
      catch (err) {
        console.error('Error fetching profile: ', err.respone ? err.respone.data : err.message);
        setError('Error fetching profile information');
      }
    };

    fetchUserProfile();
  }, [token, currentUser.id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', currentUser.id);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('note', note);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const response = await axios.put('http://localhost:3000/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Profile updated successfully');
      onProfileUpdate({ username, email, name, surname, note, avatar: response.data.avatar });
      setPassword('');
    }
    catch (err) {
      console.error('Error updating profile: ', err.respone ? err.respone.data : err.message);
      setError('Error updating profile information');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleUpdateProfile}>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" />
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Surname" required />
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a note about yourself"></textarea>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        {preview && <img src={preview} alt="Avatar preview" width="100" />}
        <button type="submit">Update profile</button>
      </form>
    </div>
  );
};

Profile.propTypes = {
  token: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string,
    name: PropTypes.string,
    surname: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  onProfileUpdate: PropTypes.func.isRequired,
};

export default Profile;