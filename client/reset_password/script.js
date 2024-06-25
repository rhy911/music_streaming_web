document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("reset-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const newPassword = document.getElementById("new-password").value;

    if (!email || !newPassword) {
      alert("Email and new password are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Password reset successful");
        window.location.href = "/sign_in/sign_in.html";
      } else {
        const errorData = await response.json();
        alert(`Password reset failed: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("An error occurred while resetting password");
    }
  });
});
