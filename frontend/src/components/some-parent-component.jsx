import ChatButton from './shared/ChatButton';

const SomeParentComponent = () => {
  // Assuming you have the user data from your auth system
  const currentUser = {
    _id: "user-id",
    fullname: "User Name",
    email: "user@example.com"
  };

  return (
    <div>
      {/* Other components */}
      <ChatButton 
        userType="student" // or "recruiter" based on the user type
        currentUser={currentUser}
      />
    </div>
  );
};

export default SomeParentComponent; 