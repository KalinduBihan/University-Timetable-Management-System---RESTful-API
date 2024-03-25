# University-Timetable-Management-System---RESTful-API

Welcome to the University Timetable Management API repository! This comprehensive RESTful API has been meticulously developed as part of an assignment to streamline the management of a university's intricate timetable system.

## Introcution

This repository houses a robust API solution tailored specifically for managing timetables within a university environment. With a focus on efficiency and user-friendliness, the API allows for the seamless organization and coordination of schedules across different faculties, years, and semesters.

## Key Features

- Faculty-Specific Timetables: Efficiently manage timetables tailored to the unique needs of each faculty within the university.
- Role-Based Access Control: Define multiple user roles (e.g., Admin, Faculty, Student) with different access levels to enhance security.
- Secure Authentication: Implement secure authentication mechanisms to ensure authorized access to the API.
- Course Management: Streamline course management by handling course details, including name, code, description, and credits.
- Room and Resource Booking: Manage the availability and booking of classrooms and resources to prevent scheduling conflicts.
- Notification System: Keep users informed of important timetable changes, room allocations, or announcements through a robust notification system.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT` - Port that server will listen on

`MONGO_URI` - Mongo db URL

`SECRET` - JWT token

`CORDINATOR` - Admin mail

`APP_PASSWORD` - Secret mail password for gmail service (nodemailer)

## Installation

Node.js are required.
(https://nodejs.org/en/download/current)

Install the necessary dependencies using npm.

```bash
  cd backend
  npm install
```

Set Up Environment Variables: Create a `.env` file in the root directory of the project and add the required environment variables. Refer to the `Environment Variables` file for guidance.

Run the project

```bash
  npm run dev
```

## API Endpoint Documentation

The University Timetable Management API provides the following endpoints:

- Authentication Endpoints:

`POST: http://localhost:4000/api/user/signup `- Register a new user.

`POST: http://localhost:4000/api/user/login `- Log in an existing user and generate a JWT token.

`GET: http://localhost:4000/api/user/studentList `- Get the students list.

`GET: http://localhost:4000/api/user/profile `- Get user progile details.

- Course Endpoints:

`POST: http://localhost:4000/api/course/`- Create a new course.

`GET: http://localhost:4000/api/course/`- Get a list all courses.

`PATCH: http://localhost:4000/api/course/:id`- Update a course.

`DELETE: http://localhost:4000/api/course/:id`- Delete a course.

`GET: http://localhost:4000/api/course/:id`- Get a specific course.

`PATCH: http://localhost:4000/api/course/:id/assign-faculty`- Assign course to faculty.

`GET: http://localhost:4000/api/course/allCourses/:faculty`- Get courses according to faculty.

- Enrollment Endpoints:

`POST: http://localhost:4000/api/enroll`- Enroll to a course.

`GET: http://localhost:4000/api/enroll/:id`- Get enroll courses of specific student.

`GET: http://localhost:4000/api/enroll`- Get list of students enrolled to specific course.

- Booking Endpoint:

`POST: http://localhost:4000/api/booking/`- Create a new booking.

`GET: http://localhost:4000/api/booking/`- Get all bookings.

`GET: http://localhost:4000/api/booking/:id`- Get specific booking.

`DELETE: http://localhost:4000/api/booking/:id`- Delete a booking.

`PATCH: http://localhost:4000/api/booking/:id`- Upadate a booking.

`GET: http://localhost:4000/api/booking/myBooking/`- Get all bokkings according to specific student.

- Timetable Endpoint:

`POST: http://localhost:4000/api/timetable/` - Create a new timetable.

`GET: http://localhost:4000/api/timetable/:code/:faculty` - Get a specific timetable.

`DELETE: http://localhost:4000/api/timetable/:id` - Delete a timetable.

`PATCH: http://localhost:4000/api/timetable/:id` - Update a timetable.

`GET: http://localhost:4000/api/timetable/` - Get all timetables.

- Notification Endpoints:

`POST: http://localhost:4000/api/notifications` - Create anew notice.

`GET: http://localhost:4000/api/notifications` - Get all notices.

`GET: http://localhost:4000/api/notifications/:code/:faculty` - Get notices by faculty and semester.

## Running Tests

To run tests, run the following command

```bash
  npx jest
```

To get coverage

```bash
  npx jest --coverage
```

## Conclusion

The University Timetable Management API offers a comprehensive solution for efficiently managing timetables within a university environment. With its intuitive design and robust features, it simplifies the complex task of organizing schedules, ensuring a smooth and seamless experience for users.

## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) license.
