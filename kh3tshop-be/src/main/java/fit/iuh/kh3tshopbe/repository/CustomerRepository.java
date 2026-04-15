package fit.iuh.kh3tshopbe.repository;

import fit.iuh.kh3tshopbe.entities.Account;
import fit.iuh.kh3tshopbe.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Customer findByEmail(String email);
    boolean existsByEmail(String email);
    Customer findById(int id);


    Optional<Customer> findByAccount(Account account);
}
