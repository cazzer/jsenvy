jsenvy
=====

**In one sentence:** Minimal JavaScripting environment for when you just want to mess around in the console.

**Don't believe me?** I don't believe me anymore either; sadly I allowed the domain to lapse so this project is no longer available.

## What it does
JS Envy allows you to load any JavaScript libraries from [CDNJS](http://cdnjs.com/) that you want to experiment with. If you want to load a library from another location you can also enter the full URL to a hosted copy of the library.

### What it doesn't do
There is no dependency detection so remember to add these yourselves. Yes it's annoying, but it's much less annoying than actually implementing it.

### What I would like it to do
- Autoload dependencies for libraries from CDNJS
- In-page console
- API documentation integration
- Solve world hunger

## How it does it
The CDNJS library is loaded along with the page so you can query it quickly. When a library is selected, (or a custom URL is entered), JS Envy adds the new script to the page and drops the visual cue for you once it has successfully loaded.

## Technologies used
- [Bootstrap](http://getbootstrap.com/) - for the fresh looking interface

And that's it. I didn't want to use any other JavaScript libraries to avoid conflicts so I've also avoided adding anything of mine to the global scope.
