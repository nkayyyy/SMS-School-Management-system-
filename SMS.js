const prompt = require("prompt-sync")({sigint:true});
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let users = [];
let loggedInUser = null;

// Load existing users from JSON file
function loadUsers() {
  try {
    const data = fs.readFileSync('SMS.json');
    users = JSON.parse(data);
  } catch (err) {
    users = [];
  }
}

// Save users to JSON file
function saveUsers() {
  const data = JSON.stringify(users);
  fs.writeFileSync('SMS.json', data);
}

// Generate a unique student number
function generateStudentNumber() {
  const existingNumbers = users.filter(user => user.role === 'student').map(user => user.studentNumber);
  let newNumber = Math.floor(Math.random() * 9000) + 1000;
  while (existingNumbers.includes(newNumber)) {
    newNumber = Math.floor(Math.random() * 9000) + 1000;
  }
  return newNumber;
}

// Login as a student
function loginStudent() {
  rl.question('Enter your username: ', (username) => {
    rl.question('Enter your password: ', (password) => {
      const user = users.find(user => user.username === username && user.password === password && user.role === 'student');
      if (user) {
        loggedInUser = user;
        console.log(`Logged in as ${user.name} (Student)`);
        showStudentMenu();
      } else {
        console.log('Invalid username or password. Please try again.');
        showLoginMenu();
      }
    });
  });
}

// Login as a teacher
function loginTeacher() {
  rl.question('Enter your username: ', (username) => {
    rl.question('Enter your password: ', (password) => {
      const user = users.find(user => user.username === username && user.password === password && user.role === 'teacher');
      if (user) {
        loggedInUser = user;
        console.log(`Logged in as ${user.name} (Teacher)`);
        showTeacherMenu();
      } else {
        console.log('Invalid username or password. Please try again.');
        showLoginMenu();
      }
    });
  });
}

// Register a new student
function registerStudent() {
  rl.question('Enter your name: ', (name) => {
    rl.question('Enter a username: ', (username) => {
      rl.question('Enter a password: ', (password) => {
        const studentNumber = generateStudentNumber();
        const newStudent = {
          name,
          username,
          password,
          role: 'student',
          studentNumber,
          courses: [],
        };
        users.push(newStudent);
        saveUsers();
        console.log(`Student registration successful. Your student number is ${studentNumber}.`);
        showLoginMenu();
      });
    });
  });
}

// Register a new teacher
function registerTeacher() {
  rl.question('Enter your name: ', (name) => {
    rl.question('Enter a username: ', (username) => {
      rl.question('Enter a password: ', (password) => {
        const newTeacher = {
          name,
          username,
          password,
          role: 'teacher',
        };
        users.push(newTeacher);
        saveUsers();
        console.log('Teacher registration successful.');
        showLoginMenu();
      });
    });
  });
}

// Reset user password
function resetPassword() {
  rl.question('Enter your username: ', (username) => {
    const user = users.find(user => user.username === username);
    if (user) {
      rl.question('Enter a new password: ', (newPassword) => {
        user.password = newPassword;
        saveUsers();
        console.log('Password reset successful. You can now log in with your new password.');
        showLoginMenu();
      });
    } else {
      console.log('User not found. Please try again.');
      showLoginMenu();
    }
  });
}

// Show student menu
function showStudentMenu() {
  console.log('\n--- Student Menu ---');
  console.log('1. Register for Courses');
  console.log('2. Review Tests');
  console.log('3. Ask a Question');
  console.log('4. Logout');
  rl.question('Enter your choice: ', (choice) => {
    switch (choice) {
      case '1':
        registerCourses();
        break;
      case '2':
        reviewTests();
        break;
      case '3':
        askQuestion();
        break;
      case '4':
        loggedInUser = null;
        showLoginMenu();
        break;
      default:
        console.log('Invalid choice. Please try again.');
        showStudentMenu();
        break;
    }
  });
}

// Show teacher menu
function showTeacherMenu() {
  console.log('\n--- Teacher Menu ---');
  console.log('1. Give Test');
  console.log('2. Give Course Registration Advice');
  console.log('3. Logout');
  rl.question('Enter your choice: ', (choice) => {
    switch (choice) {
      case '1':
        giveTest();
        break;
      case '2':
        giveRegistrationAdvice();
        break;
      case '3':
        loggedInUser = null;
        showLoginMenu();
        break;
      default:
        console.log('Invalid choice. Please try again.');
        showTeacherMenu();
        break;
    }
  });
}

// Register courses for a student
function registerCourses() {
  console.log('\n--- Available Courses ---');
  console.log('1. Intro Engineering');
  console.log('2. Calculus 1');
  console.log('3. Physics 1');
  console.log('4. Linear Algebra for Engineers');
  console.log('5. Technical Communication');
  rl.question('Enter the course number you want to register for (e.g., 1): ', (courseNumber) => {
    const course = getCourseByNumber(courseNumber);
    if (course) {
      loggedInUser.courses.push(course);
      saveUsers();
      console.log(`Course ${course.name} registered successfully. Your student number is ${loggedInUser.studentNumber}.`);
    } else {
      console.log('Invalid course number. Please try again.');
    }
    showStudentMenu();
  });
}

// Get course details by course number
function getCourseByNumber(courseNumber) {
  const courses = [
    { number: '1', name: 'Intro Engineering' },
    { number: '2', name: 'Calculus 1' },
    { number: '3', name: 'Physics 1' },
    { number: '4', name: 'Linear Algebra for Engineers' },
    { number: '5', name: 'Technical Communication' },
  ];
  return courses.find(course => course.number === courseNumber);
}

// Review tests for a student
function reviewTests() {
  console.log('\n--- Test Scores ---');
  if (loggedInUser.courses.length === 0) {
    console.log('No courses registered yet.');
  } else {
    loggedInUser.courses.forEach(course => {
      console.log(`Course: ${course.name}`);
      console.log(`Grade: ${getGrade(course)}`);
    });
  }
  showStudentMenu();
}

// Get grade for a course
function getGrade(course) {
  // Calculate the grade based on the student's performance in the course
  // You can implement your own logic here
  const grades = ['A', 'B', 'C', 'D', 'F'];
  return grades[Math.floor(Math.random() * grades.length)];
}

// Ask a question to a course lecturer
function askQuestion() {
  rl.question('Enter your question: ', (question) => {
    const courseLecturer = 'Course Lecturer'; // Replace with the actual lecturer for the course
    console.log(`Question sent to ${courseLecturer} successfully.`);
    showStudentMenu();
  });
}

// Give a test to a student
function giveTest() {
  rl.question('Enter the student number: ', (studentNumber) => {
    const student = users.find(user => user.studentNumber === parseInt(studentNumber) && user.role === 'student');
    if (student) {
      console.log(`Giving test to ${student.name}...`);
      // Implement the test giving process here
    } else {
      console.log('Student not found. Please try again.');
    }
    showTeacherMenu();
  });
}

// Give course registration advice to a student
function giveRegistrationAdvice() {
  rl.question('Enter the student number: ', (studentNumber) => {
    const student = users.find(user => user.studentNumber === parseInt(studentNumber) && user.role === 'student');
    if (student) {
      console.log(`Giving course registration advice to ${student.name}...`);
      // Implement the course registration advice process here
    } else {
      console.log('Student not found. Please try again.');
    }
    showTeacherMenu();
  });
}

// Show the login menu
function showLoginMenu() {
  console.log('\n--- Login Menu ---');
  console.log('1. Student Login');
  console.log('2. Teacher Login');
  console.log('3. Register as Student');
  console.log('4. Register as Teacher');
  console.log('5. Reset Password');
  console.log('6. Exit');
  rl.question('Enter your choice: ', (choice) => {
    switch (choice) {
      case '1':
        loginStudent();
        break;
      case '2':
        loginTeacher();
        break;
      case '3':
        registerStudent();
        break;
      case '4':
        registerTeacher();
        break;
      case '5':
        resetPassword();
        break;
      case '6':
        rl.close();
        break;
      default:
        console.log('Invalid choice. Please try again.');
        showLoginMenu();
        break;
    }
  });
}

// Load existing users
loadUsers();

// Start the application
console.log('Welcome to the School Management System!');
showLoginMenu();

