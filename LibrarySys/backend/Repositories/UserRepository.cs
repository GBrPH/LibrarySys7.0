using LibrarySys.BackEnd.Data;
using LibrarySys.BackEnd.Models;
using System.Collections.Generic;
using System.Linq;

namespace LibrarySys.BackEnd.Repositories
{
    public class UserRepository
    {
        private readonly LibraryContext _db;

        public UserRepository(LibraryContext db)
        {
            _db = db;
            SeedData();
        }

        private void SeedData()
        {
            if (!_db.Users.Any())
            {
                _db.Users.AddRange(
                    new User
                    {
                        Id = 1,
                        Username = "HMIR",
                        Password = "123456", 
                        FullName = "Head Librarian",
                        Role = "Librarian",
                        IsActive = true
                    },
                    new User
                    {
                        Id = 2,
                        Username = "B1",
                        Password = "123456", 
                        FullName = "John Doe",
                        Role = "Borrower",
                        IsActive = true
                    },
                    new User
                    {
                        Id = 3,
                        Username = "B2",
                        Password = "123456", 
                        FullName = "Jane Smith",
                        Role = "Borrower",
                        IsActive = true
                    }
                );
                _db.SaveChanges();
            }
        }

        public IEnumerable<User> GetAll() =>
            _db.Users.ToList();

        public User GetById(int id) =>
            _db.Users.Find(id);

        public IEnumerable<User> Search(string username, string role, bool? isActive)
        {
            var query = _db.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(username))
                query = query.Where(u => u.Username.Contains(username));

            if (!string.IsNullOrWhiteSpace(role))
                query = query.Where(u => u.Role == role);

            if (isActive.HasValue)
                query = query.Where(u => u.IsActive == isActive.Value);

            return query.ToList();
        }

        public User Insert(User user)
        {
            _db.Users.Add(user);
            _db.SaveChanges();
            return user;
        }

        public User RegisterBorrower(string username, string fullName)
        {
            var user = new User
            {
                Username = username,
                FullName = fullName,
                Role = "Borrower",
                IsActive = true
            };

            _db.Users.Add(user);
            _db.SaveChanges();
            return user;
        }

        // 1. MODIFY THIS EXISTING METHOD
        public User Update(User user)
        {
            var existing = _db.Users.Find(user.Id);
            if (existing == null) return null;

            existing.Username = user.Username;
            // REMOVED: existing.FullName = user.FullName; so admins can't change it here
            existing.Role = user.Role;
            existing.IsActive = user.IsActive;

            _db.SaveChanges();
            return existing;
        }

        // 2. ADD THIS BRAND NEW METHOD
        public User UpdateFullName(string username, string newFullName)
        {
            var existing = _db.Users.FirstOrDefault(u => u.Username.ToLower() == username.ToLower());
            if (existing == null) return null;

            existing.FullName = newFullName;
            _db.SaveChanges();
            return existing;
        }

        public bool Delete(int id)
        {
            var user = _db.Users.Find(id);
            if (user == null) return false;

            _db.Users.Remove(user);
            _db.SaveChanges();
            return true;
        }
    }
}