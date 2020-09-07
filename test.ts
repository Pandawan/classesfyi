/*
const registerResponse = await fetch("http://localhost:3000/register", {
  method: "POST",
  body: JSON.stringify({
    email: "migueltenant@gmail.com",
    classes: [
      {
        CRN: "25995",
        department: "MATH",
        course: "1A",
        campus: "DA",
      },
    ],
  }),
});

if (registerResponse.ok) {
  console.log(await registerResponse.json());
} else {
  console.error(registerResponse.statusText);
  Deno.exit(1);
}
*/

const refreshResponse = await fetch("http://localhost:3000/refresh", {
  method: "POST",
});

if (refreshResponse.ok) {
  console.log(await refreshResponse.json());
} else {
  console.error(refreshResponse.statusText);
  Deno.exit(1);
}
