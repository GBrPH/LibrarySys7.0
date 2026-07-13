using LibrarySys.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
using System.Net.Http.Headers;

public class BooksModel : PageModel
{
    public List<BookDto> Books { get; set; } = new();

    public async Task OnGetAsync()
    {
        using var client = new HttpClient();
        var token = HttpContext.Session.GetString("JwtToken");
        if (!string.IsNullOrEmpty(token))
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("https://localhost:7089/api/Book/GetAllBooks");
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            Books = JsonConvert.DeserializeObject<List<BookDto>>(json);
        }
    }

    public async Task<IActionResult> OnPostBorrowAsync(int id, int userId)
    {
        using var client = new HttpClient();
        var token = HttpContext.Session.GetString("JwtToken");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await client.PostAsync($"https://localhost:7089/api/Book/BorrowingBook/{id}?userId={userId}", null);
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostReturnAsync(int id, int userId)
    {
        using var client = new HttpClient();
        var token = HttpContext.Session.GetString("JwtToken");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        await client.PostAsync($"https://localhost:7089/api/Book/ReturnBook/{id}?userId={userId}", null);
        return RedirectToPage();
    }
}
