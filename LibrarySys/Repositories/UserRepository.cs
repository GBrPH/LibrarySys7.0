using LibrarySys.Dtos;
using System.Collections.Generic;

namespace LibrarySys.Repositories
{
    public class UserRepository
    {
        private readonly List<UserDto> _users;

        public UserRepository()
        {
            //Dummy Data but users
            _users = new List<UserDto>
            {
                new UserDto { Id = 1, Username = "librarian1", FullName = "Alice Librarian", Role = "Librarian", IsActive = true },
                new UserDto { Id = 2, Username = "faculty1", FullName = "Bob Faculty", Role = "Faculty", IsActive = true },
                new UserDto { Id = 3, Username = "student1", FullName = "Charlie Student", Role = "Student", IsActive = true }
            };
        }

        public IEnumerable<UserDto> GetAll()
        {
            return _users;
        }
        public UserDto GetById(int id)
        {
            return _users.Find(u => u.Id == id);
        }

        public IEnumerable<UserDto> Search(string username = null, string role = null, bool? isActive = null)
        {
            var query = _users.AsQueryable();

            if (!string.IsNullOrEmpty(username))
                query = query.Where(u => u.Username.Contains(username, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role.Equals(role, StringComparison.OrdinalIgnoreCase));

            if (isActive.HasValue)
                query = query.Where(u => u.IsActive == isActive.Value);

            return query.ToList();
        }
        public UserDto Insert(UserDto user)
        {
            user.Id = _users.Count + 1;
            _users.Add(user);
            return user;
        }

        public UserDto Update(UserDto user)
        {
            var existing = _users.Find(u => u.Id == user.Id);
            if (existing != null)
            {
                existing.Username = user.Username;
                existing.FullName = user.FullName;
                existing.Role = user.Role;
                existing.IsActive = user.IsActive;
            }
            return existing;
        }
        public bool Delete(int id)
        {
            var user = _users.Find(u => u.Id == id);
            return _users.Remove(user);
        }
    }
}
