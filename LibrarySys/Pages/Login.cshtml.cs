using LibrarySys.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using System.Net.Http.Headers;

public class LoginModel : PageModel
{
    [BindProperty]
    public LoginDto Login { get; set; }

    public async Task<IActionResult> OnPostAsync()
    {
        using var client = new HttpClient();
        var response = await client.PostAsJsonAsync("https://localhost:5001/api/Auth/LogIn", Login);

        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            var obj = JsonConvert.DeserializeObject<dynamic>(json);
            string token = obj.token;

            HttpContext.Session.SetString("JwtToken", token);  
            return RedirectToPage("/Books/Index");             
        }

        ModelState.AddModelError(string.Empty, "Invalid login attempt.");
        return Page();
    }
}
