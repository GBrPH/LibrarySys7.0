using LibrarySys.Dtos;
using LibrarySys.Repositories;
using System.Collections.Generic;

namespace LibrarySys.Services
{
    public class UserService
    {
        private readonly UserRepository _repo;

        public UserService(UserRepository repo)
        {
            _repo = repo;
        }

        public IEnumerable<UserDto> GetAll()  => _repo.GetAll()!;

        public UserDto GetById(int id) => _repo.GetById(id);

        public IEnumerable<UserDto> Search(string username, string role, bool? isActive)
            => _repo.Search(username, role, isActive)!;

        public UserDto Register(UserDto user) => _repo.Insert(user)!;

        public UserDto RegisterBorrower(string username, string fullName)
        {
            var newUser = new UserDto
            {
                Username = username,
                FullName = fullName,
                Role = "Borrower",   
                IsActive = true
            };

            return _repo.Insert(newUser)!;
        }

        public UserDto Update(UserDto user) => _repo.Update(user);

        public bool Delete(int id)  => _repo.Delete(id);      
    }
}
