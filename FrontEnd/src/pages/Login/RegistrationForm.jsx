import React,{useState} from "react";
import styled from "styled-components";
import avatar from '../../images/avatar.jpg';
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  font-family: "Arial", sans-serif;
  flex-direction: row;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: column; 
    height: auto;
  }
`;

const LeftPane = styled.div`
  flex: 1;
  background: linear-gradient(45deg, #ffd700, #ffcc00);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 30px;


  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Avatar = styled.div`
  width: 130px;
  height: 130px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;


const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

const RightPane = styled.div`
  flex: 2;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;

  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Form = styled.div`
  width: 80%;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  transition: all 0.3s ease;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: bold;
  color: black;
  display: block;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-size: 16px;
  transition: all 0.3s ease;
  color:black;

  &:focus {
    border-color: #ffd700;
    outline: none;
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  }
`;

const ButtonGroup = styled.div`
  text-align:center;
  margin-top: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const Button = styled.button`
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 45%;
  background-color: ${({ type }) => (type === "save" ? "#ffd700" : "#ddd")};
  color: #fff;

  &:hover {
    background-color: ${({ type }) => (type === "save" ? "#ffcc00" : "#bbb")};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #333;
  cursor: pointer;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 0;
    cursor: pointer;
  }
`;

const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  appearance: none;
  border: 2px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &:checked {
    background-color: #ffd700;
    border-color: #ffd700;
  }

  &:checked::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 10px;
    height: 10px;
    background-color: white;
    border-radius: 2px;
  }

  &:hover {
    border-color: #ffd700;
  }
`;



const Text = styled.h2`
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  color: black;
  letter-spacing: 1px;
  margin-bottom: 10px;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  &:hover {
    color: #54a0ff;
  }
`;

const SubText = styled.p`
  font-size: 18px;
  text-align: center;
  color: #666;
  margin: 10px 0;
  transition: color 0.3s ease;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  &:hover {
    color: #54a0ff;
  }
`;


const StyledSelect = styled.select`
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  border: 2px solid #ccc;
  background-color: #f7f7f7;
  transition: all 0.3s ease;

  &:focus {
    border-color: #54a0ff;
    box-shadow: 0 0 8px rgba(84, 160, 255, 0.6);
  }
`;

const ScrollableFormContainer = styled.div`
  /* Default for desktop and larger screens */
  max-height: 650px;
  width:100%   ;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;

  /* Responsive design for tablets */
  @media (max-width: 1024px) {
    max-height: 400px; /* Adjust height for tablets */
    padding: 15px;     /* Adjust padding for tablets */
  }

  /* Responsive design for mobile */
  @media (max-width: 768px) {
    max-height: 400px; /* Adjust height for mobile */
    padding: 10px;     /* Adjust padding for mobile */
  }
`;

const TamilNaduDistricts = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivagangai",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thoothukudi (Tuticorin)",
  "Tiruchirappalli (Trichy)",
  "Tirunelveli",
  "Tirupattur",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

const RegistrationForm = () => {
  const [isRegistration, setIsRegistration] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    preferredCategories: [],
    languagePreference: "english",
    dateOfBirth: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setFormData((prevData) => {
      const updatedCategories = checked
        ? [...prevData.preferredCategories, value]
        : prevData.preferredCategories.filter((category) => category !== value);
      return { ...prevData, preferredCategories: updatedCategories };
    });
  };

  const handleLoginInputChange = (event) => {
    const { name, value } = event.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    
    try {
      // Step 1: Register the user
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, district: selectedDistrict }),
      });
  
      if (response.ok) {
        alert("Registration successful!");
  
        // Step 2: Send a confirmation email
        const emailResponse = await fetch("http://localhost:5000/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: formData.email, // User's email address
            subject: "கணினி_X's InfoScrap User Registration",
            text: "Congratulations! Your account has been successfully registered with InfoScrap. We are excited to bring you personalized and local news tailored to your preferences. Stay informed and connected with the stories that matter most to you. Welcome to the InfoScrap community! ",
          }),
        });
  
        if (emailResponse.ok) {
          alert("A confirmation email has been sent.");
        } else {
          console.error("Failed to send email.");
          alert("Registration successful, but the confirmation email could not be sent.");
        }
  
        // Reset form fields
        setFormData({
          name: "",
          email: "",
          password: "",
          mobile: "",
          preferredCategories: [],
          languagePreference: "english",
          dateOfBirth: "",
        });
        setSelectedDistrict("");
        navigate("/home"); 
      } else {
        alert("Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  };
  

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        const { preferences, location } = data.user;
        // Handle success (e.g., redirect to dashboard or show success message)
      } else {
        console.error('Login failed:', data.message);
        alert('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <Container>
      <LeftPane>
        <Avatar>
          <AvatarImage src={avatar} alt="User Avatar" />
        </Avatar>
        <Text>Get Started with INFOSCRAP</Text>
        <SubText>Complete your profile and choose your preferences to get personalised updates.</SubText>
      </LeftPane>
      <RightPane>
        <ScrollableFormContainer>
          <ButtonGroup>
            {isRegistration && (
              <Button type="button" onClick={() => setIsRegistration(false)} style={{backgroundColor:"green",width:"150px"}}>
                Sign In
              </Button>
            )}
          </ButtonGroup>
          <Form onSubmit={handleSubmit}>
            {isRegistration ? (
              <>
                <FormGroup>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email (Enter valid email to get mail updates)"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Mobile Number (Optional)</Label>
                  <Input
                    type="number"
                    name="mobile"
                    placeholder="Enter your mobile number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Preferred Categories</Label>
                  {["Politics", "Sports", "Technology", "Entertainment","Business","Economy","Health","Medicine","Science"].map(
                    (category) => (
                      <CheckboxLabel key={category}>
                        <CheckboxInput
                          type="checkbox"
                          value={category}
                          checked={formData.preferredCategories.includes(
                            category
                          )}
                          onChange={handleCheckboxChange}
                        />{" "}
                        {category}
                      </CheckboxLabel>
                    )
                  )}
                </FormGroup>
                <FormGroup>
                  <Label>Location (District)</Label>
                  <StyledSelect
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    style={{backgroundColor:"white",color:"black"}}
                  >
                    <option value="" disabled>
                      Select your district
                    </option>
                    {TamilNaduDistricts.map((district, index) => (
                      <option key={index} value={district}>
                        {district}
                      </option>
                    ))}
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label>Language Preference</Label>
                  <StyledSelect
                    name="languagePreference"
                    value={formData.languagePreference}
                    onChange={handleInputChange}
                    style={{backgroundColor:"white",color:"black"}}
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="tamil">Tamil</option>
                    <option value="other">Other</option>
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    style={{backgroundColor:"white",color:"black"}}
                  />
                </FormGroup>
                <ButtonGroup>
                  <Button type="submit" onClick={handleSubmit} style={{backgroundColor:"blue"}}>Register</Button>
                </ButtonGroup>
              </>
            ) : (
              <>
                {/* Login Form Fields */}
                <FormGroup>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={handleLoginInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                  />
                </FormGroup>
                <ButtonGroup>
                  <Button type="button" onClick={() => setIsRegistration(true)} style={{backgroundColor:"green"}}>
                    Back to Registration
                  </Button>
                  <Button type="submit" onClick={handleLogin}>Sign In</Button>
                </ButtonGroup>
              </>
            )}
          </Form>
        </ScrollableFormContainer>
      </RightPane>
    </Container>
  );  
};

export default RegistrationForm;
