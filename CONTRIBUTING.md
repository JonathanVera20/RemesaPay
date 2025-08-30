# 🤝 Contributing to RemesaPay Ecuador

Thank you for considering contributing to RemesaPay Ecuador! We welcome contributions from developers who want to help revolutionize remittances for Ecuadorian families.

## 🎯 **How to Contribute**

### **Types of Contributions**
- 🐛 **Bug fixes** - Help us improve stability
- ✨ **New features** - Add Ecuador-specific functionality
- 📚 **Documentation** - Improve guides and API docs
- 🌍 **Translations** - Help with Spanish localization
- 🧪 **Testing** - Add more comprehensive tests
- 🎨 **UI/UX** - Enhance Ecuador user experience

### **Getting Started**

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/remesapay-ecuador.git
   cd remesapay-ecuador
   ```

2. **Set up development environment**
   ```bash
   npm install
   npm run dev
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/ecuador-phone-validation
   ```

4. **Make your changes**
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation if needed

5. **Test your changes**
   ```bash
   npm test                    # Run all tests
   cd contracts && npm test    # Test smart contracts
   ```

6. **Submit a pull request**
   - Describe your changes clearly
   - Reference any related issues
   - Include screenshots for UI changes

## 📋 **Development Guidelines**

### **Code Style**
- **TypeScript**: Use strict typing
- **React**: Functional components with hooks
- **CSS**: Tailwind CSS utility classes
- **Naming**: Clear, descriptive variable names

### **Ecuador-Specific Guidelines**
- **Language**: Spanish text for user-facing content
- **Currency**: Always display USD (Ecuador's currency)
- **Phone**: Validate +593 Ecuador phone format
- **Timezone**: Use America/Guayaquil
- **Colors**: Incorporate Ecuador flag colors (#FFD700, #0077C8, #CE1126)

### **Smart Contract Guidelines**
- **Security**: Follow OpenZeppelin standards
- **Testing**: Maintain 100% test coverage
- **Gas Optimization**: Minimize transaction costs
- **Upgradability**: Use proxy patterns for main contracts

### **Commit Messages**
Use conventional commit format:
```
feat(ecuador): add phone number validation for +593
fix(wallet): resolve MetaMask connection issue
docs(readme): update installation instructions
test(contracts): add edge case tests for transfers
```

## 🧪 **Testing Requirements**

### **Frontend Testing**
- Unit tests for components
- Integration tests for wallet connection
- E2E tests for transfer flow

### **Smart Contract Testing**
- All functions must have tests
- Edge cases and error conditions
- Gas usage optimization tests

### **Example Test Structure**
```typescript
describe('Ecuador Phone Validation', () => {
  it('should validate +593 phone numbers', () => {
    expect(validateEcuadorPhone('+593987654321')).toBe(true);
  });
  
  it('should reject invalid formats', () => {
    expect(validateEcuadorPhone('+1234567890')).toBe(false);
  });
});
```

## 🌍 **Ecuador Localization**

### **Spanish Translation Guidelines**
- Use formal "usted" form for respectful communication
- Ecuador-specific terms (e.g., "billetera" for wallet)
- Clear, simple language for financial terms
- Include Ecuador cultural context

### **Currency Format**
- Always show USD symbol ($)
- Use comma separators for thousands
- Two decimal places for precision
- Example: $1,234.56

### **Date/Time Format**
- DD/MM/YYYY format (Ecuador standard)
- 24-hour time format
- America/Guayaquil timezone

## 🔒 **Security Guidelines**

### **Sensitive Data**
- Never commit private keys or secrets
- Use environment variables for configuration
- Encrypt sensitive user data
- Follow OWASP security guidelines

### **Smart Contract Security**
- Reentrancy protection
- Access control mechanisms
- Input validation and sanitization
- Emergency pause functionality

## 📖 **Documentation Standards**

### **Code Documentation**
- JSDoc comments for functions
- Inline comments for complex logic
- README files for each major component
- API documentation with examples

### **User Documentation**
- Step-by-step guides in Spanish
- Screenshots for UI interactions
- Troubleshooting sections
- FAQ for common questions

## 🚀 **Pull Request Process**

### **Before Submitting**
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Changes tested with Ecuador use cases
- [ ] No merge conflicts

### **PR Template**
```markdown
## 🎯 Purpose
Brief description of changes

## 🇪🇨 Ecuador Impact
How this affects Ecuador users

## 🧪 Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Ecuador-specific scenarios tested

## 📸 Screenshots
Include UI changes if applicable

## 📝 Checklist
- [ ] Code follows guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Ready for review
```

## 🏆 **Recognition**

Contributors will be recognized in:
- Repository contributors list
- Release notes for significant contributions
- Community Discord with contributor role
- Annual community appreciation events

## 📞 **Get Help**

### **Development Questions**
- **Discord**: [Join our developer channel](https://discord.gg/remesapay-dev)
- **GitHub Issues**: Tag questions with `question` label
- **Email**: dev@remesapay.com

### **Ecuador-Specific Questions**
- **Telegram**: Ecuador community group
- **WhatsApp**: Ecuador developer support
- **Email**: ecuador@remesapay.com

## 🌟 **Code of Conduct**

We are committed to providing a welcoming and inclusive environment for all contributors, especially those from the Ecuador community. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

### **Our Values**
- **Respect**: For all contributors regardless of background
- **Inclusivity**: Welcome Ecuador developers and perspectives
- **Quality**: Maintain high standards for Ecuador families
- **Transparency**: Open development process
- **Community**: Build together for Ecuador's benefit

---

**¡Gracias por contribuir a RemesaPay Ecuador! 🇪🇨**

Together, we're building the future of remittances for Ecuadorian families.
