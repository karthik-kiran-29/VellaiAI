// Basic TypeScript example

// Interface definition
interface User {
    id: number;
    name: string;
    email: string;
}

// Class example
class UserService {
    private users: User[] = [];

    addUser(user: User): void {
        this.users.push(user);
    }

    getUser(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }
}

// Main function
function main(): void {
    const service = new UserService();
    
    const newUser: User = {
        id: 1,
        name: "John Doe",
        email: "john@example.com"
    };

    service.addUser(newUser);
    console.log("User added successfully");
}

main();