using System.Net.Http.Headers;
using LibrarySys.Dtos;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json; // or System.Text.Json

public class UsersModel : PageModel
{
    public List<UserDto> Users { get; set; }

    public async Task OnGetAsync()
    {
        using var client = new HttpClient();
        var token = HttpContext.Session.GetString("JwtToken");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("https://localhost:5001/api/User");
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            Users = JsonConvert.DeserializeObject<List<UserDto>>(json);
        }
        else
        {
            Users = new List<UserDto>();
        }
    }
}
