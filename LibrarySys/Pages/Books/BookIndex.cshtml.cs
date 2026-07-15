using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http.Headers;
using System.Text.Json;
using LibrarySys.Dtos;

public class BooksModel : PageModel
{
    public List<BookDto> Books { get; set; } = new();

    public async Task OnGetAsync()
    {
        using var client = new HttpClient();

        var token = HttpContext.Session.GetString("JwtToken");
        if (!string.IsNullOrEmpty(token))
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("https://localhost:7089/api/Book/GetAllBooks");
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            Books = JsonSerializer.Deserialize<List<BookDto>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<BookDto>();
        }
    }
}
