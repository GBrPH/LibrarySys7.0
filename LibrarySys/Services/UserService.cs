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
        public IEnumerable<UserDto> GetAll()
        {
            return _repo.GetAll();
        }
        public UserDto GetById(int id)
        {
            return _repo.GetById(id);
        }
        public IEnumerable<UserDto> Search(string username, string role, bool? isActive)
        {
            return _repo.Search(username, role, isActive);
        }
        public UserDto Register(UserDto user)
        {
            return _repo.Insert(user);
        }
        public UserDto Update(UserDto user)
        {
            return _repo.Update(user);
        }
        public bool Delete(int id)
        {
            return _repo.Delete(id);
        }
    }
}
