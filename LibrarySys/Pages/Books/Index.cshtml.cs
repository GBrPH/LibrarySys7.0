using LibrarySys.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;

public class BooksModel : PageModel
{
    public List<BookDto> Books { get; set; }

    public async Task OnGetAsync()
    {
        using var client = new HttpClient();
        var token = HttpContext.Session.GetString("JwtToken");
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("https://localhost:5001/api/Book");
        if (response.IsSuccessStatusCode)
        {
            var json = await response.Content.ReadAsStringAsync();
            Books = JsonConvert.DeserializeObject<List<BookDto>>(json);
        }
    }

    public async Task<IActionResult> OnPostBorrowAsync(int id)
    {
        // Call BorrowBook API with Bearer token
        return RedirectToPage();
    }

    public async Task<IActionResult> OnPostReturnAsync(int id)
    {
        // Call ReturnBook API with Bearer token
        return RedirectToPage();
    }
}
