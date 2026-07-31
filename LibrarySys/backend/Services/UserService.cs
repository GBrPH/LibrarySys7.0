using LibrarySys.BackEnd.DTOs;
using LibrarySys.BackEnd.Models;
using LibrarySys.BackEnd.Repositories;
using System.Collections.Generic;
using System.Linq;

namespace LibrarySys.BackEnd.Services
{
    public class UserService
    {
        private readonly UserRepository _repo;

        public UserService(UserRepository repo)
        {
            _repo = repo;
        }

        private UserDto ToDto(User user) =>
            user == null ? null : new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Role = user.Role,
                IsActive = user.IsActive
            };

        private User ToModel(UserDto dto) =>
            dto == null ? null : new User
            {
                Id = dto.Id,
                Username = dto.Username,
                FullName = dto.FullName,
                Role = dto.Role,
                IsActive = dto.IsActive
            };

        public IEnumerable<UserDto> GetAll()
        {
            var users = _repo.GetAll();
            return users.Select(ToDto);
        }

        public UserDto GetById(int id)
        {
            var user = _repo.GetById(id);
            return ToDto(user);
        }

        public IEnumerable<UserDto> Search(string username, string role, bool? isActive)
        {
            var users = _repo.Search(username, role, isActive);
            return users.Select(ToDto);
        }

        public UserDto Register(UserDto dto)
        {
            var model = ToModel(dto);
            var saved = _repo.Insert(model);
            return ToDto(saved);
        }

        public UserDto RegisterBorrower(string username, string fullName)
        {
            var saved = _repo.RegisterBorrower(username, fullName);
            return ToDto(saved);
        }

        public UserDto Update(UserDto dto)
        {
            var model = ToModel(dto);
            var updated = _repo.Update(model);
            return ToDto(updated);
        }

        public bool Delete(int id) => _repo.Delete(id);
    }
}