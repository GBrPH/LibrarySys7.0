using LibrarySys.Dtos;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using System.Net.Http.Headers;

public class UsersModel : PageModel
{
    public List<UserDto> Users { get; set; } = new();

    public async Task OnGetAsync()
    {
        using var client = new HttpClient();
        var token = HttpContext.Session.GetString("JwtToken");
        if (!string.IsNullOrEmpty(token))
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("https://localhost:5001/api/User/GetAll");
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            Users = JsonConvert.DeserializeObject<List<UserDto>>(json);
        }
    }
}
