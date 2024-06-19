import React, { useState, FormEvent } from 'react';

type ProfileFormProps = {
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
};

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const [name, setName] = useState<string>(user.name);
  const [avatar, setAvatar] = useState<string>(user.avatar);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user._id, name, avatar })
    });

    if (!response.ok) {
      // Handle error here
      console.error('Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="avatar">Avatar URL:</label>
        <input id="avatar" type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
      </div>
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default ProfileForm;
