# Modulu Summary

### Types of errors & handling Errors

* You Can Differentiate between different types of errors
  * Technical errors (which are thrown) 
  * Expected errors (e.g. invalid user input)
* Error Handling can be done with custom if-checks, try-catch, then-catch etc.
* You can use the Express error handling middleware to handle all unhandled errors


### Errors & Status Code

* When returning responses, it can make sense
to also set an appropriate Http status code -this lets the browser know what went wrong.
* You got success (2xx), redirect (3xx), 
client side errors (4xx), and server side serrors (5xx) codes to choose from.
* Setting status code does NOT mean that the response is incplote or the app crashed. 