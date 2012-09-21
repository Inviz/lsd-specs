describe('LSD.Storage', function() {
  var prefix = 'test';
  var getCookie = function(key, pref) {
    var bits = document.cookie.split('; ');
    for (var i = 0, j = bits.length; i < j; i++) {
      var parts = bits[i].split('=');
      if (parts[0] == (pref || '') + key) return parts[1];
    }
  }
  var setCookie = function(key, value, pref) {
    document.cookie = (pref || '') + key + '=' + value;
  }
  var unsetCookie = function(key, pref) {
    document.cookie = (pref || '') + key + '=;expires=Thu, 01-Jan-1970 00:00:01 GMT'
  }
  
  
  var getLocal = function(key, pref) {
    var value = localStorage.getItem((pref || '') + key);
    if (value != null) return value;
  }
  var setLocal = function(key, value, pref) {
    var index = parseInt(key);
    if (index > localStorage.getItem((pref || '') + 'length'))
      localStorage.setItem((pref || '') + 'length', index + 1);
    return localStorage.setItem((pref || '') + key, value)
  }
  var unsetLocal = function(key, pref) {
    var index = parseInt(key);
    if (index == localStorage.getItem((pref || '') + 'length'))
      if (index > 0)
        localStorage.setItem((pref || '') + 'length', index);
      else
        localStorage.removeItem((pref || '') + 'length', index)
    return localStorage.removeItem((pref || '') + key)
  }
  
  
  setCookie('test', 'a');
  var cookies = getCookie('test') == 'a';
  unsetCookie('test')
    
  describe('when used as a storage API', function() {
    describe('without specified adapter', function() {
      it ('should be able to choose adapter automatically', function() {
        LSD.Storage('secret', '0');
        expect(getLocal('0')).toBe('secret')
        LSD.Storage(undefined, '0')
        expect(getLocal('0')).toBeUndefined()
      })
    })
    if (cookies) describe('with specified adapter', function() {
      it ('should be able to set and unset values using that adapter', function() {
        LSD.Storage('secret', '0', null, null, null, null, 'Cookies');
        expect(getCookie('0')).toBe('secret')
        LSD.Storage(undefined, '0', null, null, null, null, 'Cookies');
        expect(getCookie('0')).toBeUndefined()
      })
    })
  });
  describe('.Cookies', function() {
    if (cookies) {
      describe('when called with no arguments', function() {
        describe('with a forced context', function() {
          it ('should import cookies into current context', function() {
            setCookie('0', '1', prefix);
            setCookie('1', '2', prefix);
            var storage = {};
            LSD.Storage.Cookies.call(storage, prefix);
            expect(storage[0]).toBe('1');
            expect(storage[1]).toBe('2');
            unsetCookie('0', prefix);
            unsetCookie('1', prefix);
          })
        })
        describe('with native array given as context', function() {
          it ('should import cookies into given context', function() {
            setCookie('0', '1');
            setCookie('1', '2');
            var storage = [];
            LSD.Storage.Cookies.call(storage);
            expect(storage[0]).toBe('1');
            expect(storage[1]).toBe('2');
            expect(storage.length).toBe(2);
            unsetCookie('0', prefix);
            unsetCookie('1', prefix);
          })
        })
        describe('with native object given as context', function() {
          it ('should import cookies into given context', function() {
            setCookie('0', '1');
            setCookie('1', '2');
            var storage = {};
            LSD.Storage.Cookies.call(storage);
            expect(storage[0]).toBe('1');
            expect(storage[1]).toBe('2');
            unsetCookie('0');
            unsetCookie('1');
          })
        })
        describe('with a callback given as a first argument', function() {
          it ('should invoke callbacks with returned values', function() {
            var args = [], i = 0;
            var callback = function(index, value, meta) {
              if (parseInt(index) == index) {
                args.push([index, value])
                i++;
              }
            }
            setCookie('1', '2');
            setCookie('0', '1');
            LSD.Storage.Cookies(callback);
            expect(i).toBe(2);
            expect(args).toEqual([['0', '1'], ['1', '2']])
            unsetCookie('0');
            unsetCookie('1');
          })
        })
      });
      describe('when called with one argument', function() {
        describe('with a forced context', function() {
          it ('should import cookies into current context and treat argument as prefix', function() {
            setCookie('0', '1', prefix);
            setCookie('1', '2', prefix);
            var storage = {};
            LSD.Storage.Cookies.call(storage, prefix);
            expect(storage[0]).toBe('1');
            expect(storage[1]).toBe('2');
            unsetCookie('0', prefix);
            unsetCookie('1', prefix);
          })
        })
        describe('with no explicit context', function() {
          describe('with a key given as a first argument', function() {
            it ('should get cookies', function() {
              setCookie('0', '1');
              expect(LSD.Storage.Cookies('0')).toBe('1');
              unsetCookie('0')
            })
          })
          describe('with a callback given as a first argument', function() {
            it ('should invoke callback with found values and treat second argument as prefix', function() {
              var args = [], i = 0;
              var callback = function(index, value, meta) {
                args.push([index, value])
                i++;
              }
              setCookie('1', '2', prefix);
              setCookie('0', '1', prefix);
              LSD.Storage.Cookies(callback, prefix);
              expect(i).toBe(2);
              expect(args).toEqual([['0', '1'], ['1', '2']])
              unsetCookie('0', prefix);
              unsetCookie('1', prefix);
            })
          })
          describe('with a context given as a first argument', function() {
            describe('with native array given as context', function() {
              it ('should import cookies into given context', function() {
                setCookie('0', '1', prefix);
                setCookie('1', '2', prefix);
                var storage = [];
                LSD.Storage.Cookies(storage, prefix);
                expect(storage[0]).toBe('1');
                expect(storage[1]).toBe('2');
                expect(storage.length).toBe(2);
                unsetCookie('0', prefix);
                unsetCookie('1', prefix);
              })
            })
            describe('with native object given as context', function() {
              it ('should import cookies into given context', function() {
                setCookie('0', '1', prefix);
                setCookie('1', '2', prefix);
                var storage = {};
                LSD.Storage.Cookies(storage, prefix);
                expect(storage[0]).toBe('1');
                expect(storage[1]).toBe('2');
                unsetCookie('0', prefix);
                unsetCookie('1', prefix);
              })
            })
            describe('with LSD.Array given as context', function() {
              it ('should import and sync array values', function() {
                var array = new LSD.Array;
                setCookie(0, 'songs');
                setCookie(1, 'god')
                LSD.Storage.Cookies(array);
                expect(array[0]).toBe('songs');
                expect(array[1]).toBe('god');
                array.splice(1, 0, 'of')
                expect(getCookie(0)).toBe('songs');
                expect(getCookie(1)).toBe('of');
                expect(getCookie(2)).toBe('god');
                array.shift()
                expect(getCookie(0)).toBe('of');
                expect(getCookie(1)).toBe('god');
               expect(getCookie(2)).toBeUndefined() 
               array.pop()
               expect(getCookie(0)).toBe('of');
               expect(getCookie(1)).toBeUndefined()
               array.pop()
               expect(getCookie(0)).toBeUndefined()
              })
            })
          })
        })
      })
      describe('when called with two arguments', function() {
        describe('with a key value pair', function() {
          it ('should set and unset cookies', function() {
            expect(getCookie('0')).toBeUndefined()
            LSD.Storage.Cookies('secret', '0')
            expect(getCookie('0')).toBe('secret')
            LSD.Storage.Cookies(undefined, '0')
            expect(getCookie('0')).toBeUndefined();
          });
        })
        describe('with a key and a callback', function() {
          it ('should execute a callback with a value of by the given key', function() {
            setCookie('0', '1');
            var args, callback = function(key, value) {
              args = [key, value]
            }
            expect(LSD.Storage.Cookies('0', callback)).toBe('1');
            expect(args).toEqual(['0', '1'])
            unsetCookie('0', '1');
          })
        })
        describe('with a context given as a first argument', function() {
          it ('should import cookies into current context', function() {
            setCookie('0', '1', prefix);
            setCookie('1', '2', prefix);
            var storage = {};
            LSD.Storage.Cookies(storage, prefix);
            expect(storage[0]).toBe('1');
            expect(storage[1]).toBe('2');
            unsetCookie('0', prefix);
            unsetCookie('1', prefix);
          })
        })
        describe('with a callback given as a first argument', function() {
          it ('should invoke callback with found values and treat second argument as prefix', function() {
            var args = [], i = 0;
            var callback = function(index, value, meta) {
              args.push([index, value])
              i++;
            }
            setCookie('1', '2', prefix);
            setCookie('0', '1', prefix);
            LSD.Storage.Cookies(callback, prefix);
            expect(i).toBe(2);
            expect(args).toEqual([['0', '1'], ['1', '2']])
            unsetCookie('0', prefix);
            unsetCookie('1', prefix);
          })
        })
      });
      describe('when called with three arguments', function() {
        describe('with a key value pair', function() {
          describe('and a callback', function() {
            it ('should set and unset values and invoke the callback', function() {
              var args, callback = function(key, value) {
                args = [key, value]
              }
              LSD.Storage.Cookies('1', '0', callback);
              expect(getCookie(0)).toBe('1')
              expect(args).toEqual(['0', '1'])
              expect(LSD.Storage.Cookies(undefined, '0', callback)).toBe(undefined);
              expect(args).toEqual(['0', undefined])
              expect(getCookie(0)).toBeUndefined()
            })
          })
          describe('and a prefix', function() {
            it ('should set and unset values and invoke the callback', function() {
              LSD.Storage.Cookies('1', '0', prefix);
              expect(getCookie(0, prefix)).toBe('1')
              expect(LSD.Storage.Cookies(undefined, '0', prefix)).toBe(undefined);
              expect(getCookie(0, prefix)).toBeUndefined()
            })
          })
        })
      })
      describe('when called with four arguments', function() {
        describe('with a key value pair', function() {
          describe('and prefix', function() {
            describe('and callback', function() {
              it ('should set and unset values and invoke the callback', function() {
                var args, callback = function(key, value) {
                  args = [key, value]
                }
                LSD.Storage.Cookies('1', '0', prefix, callback);
                expect(getCookie(0, prefix)).toBe('1')
                expect(args).toEqual(['0', '1'])
                LSD.Storage.Cookies(undefined, '0', prefix, callback);
                expect(args).toEqual(['0', undefined])
                expect(getCookie(0, prefix)).toBeUndefined()
              })
            })
            describe('and native array given as context', function() {
              it ('should set a value by that key in that context', function() {
                var storage = [];
                LSD.Storage.Cookies('1', '0', prefix, storage);
                expect(storage[0]).toBe('1');
                expect(storage.length).toBe(1);
                unsetCookie('0', prefix);
                LSD.Storage.Cookies(undefined, '0', prefix, storage);
                expect(storage[0]).toBeUndefined()
                expect(storage.length).toBe(0);
              })
            })
            describe('and native object given as context', function() {
              it ('should set a value by that key in that context', function() {
                var storage = {};
                LSD.Storage.Cookies('1', '0', prefix, storage);
                expect(storage[0]).toBe('1');
                expect(storage.length).toBeUndefined();
                unsetCookie('0', prefix);
                LSD.Storage.Cookies(undefined, '0', prefix, storage);
                expect(storage[0]).toBeUndefined()
                expect(storage.length).toBeUndefined();
              })
            })
          })
        })
      })
      describe('when used as an iterator', function() {
        describe('with LSD.array', function() {
          it ('should store values from array', function() {
            var array = LSD.Array(1,2,3);
            array.forEach(LSD.Storage.Cookies);
            expect(getCookie(0)).toBe('1');
            expect(getCookie(1)).toBe('2');
            expect(getCookie(2)).toBe('3');
            unsetCookie('0');
            unsetCookie('1');
            unsetCookie('2');
          })
        })
        describe('with sparse LSD.Array', function() {
          it ('should store values from array', function() {
            var array = LSD.Array(1)
            array.set(2, 3)
            array.forEach(LSD.Storage.Cookies);
            expect(getCookie(0)).toBe('1');
            expect(getCookie(1)).toBeUndefined()
            expect(getCookie(2)).toBe('3');
            unsetCookie('0');
            unsetCookie('1');
            unsetCookie('2');
          })
        })
        describe('with native array', function() {
          it ('should store values from array', function() {
            var array = [1,2,3];
            array.forEach(LSD.Storage.Cookies);
            expect(getCookie(0)).toBe('1');
            expect(getCookie(1)).toBe('2');
            expect(getCookie(2)).toBe('3');
            unsetCookie('0');
            unsetCookie('1');
            unsetCookie('2');
          })
        })
        describe('with sparse native array', function() {
          it ('should store values from array', function() {
            var array = [1]
            array[2] = 3;
            array.forEach(LSD.Storage.Cookies);
            expect(getCookie(0)).toBe('1');
            expect(getCookie(1)).toBeUndefined()
            expect(getCookie(2)).toBe('3');
            unsetCookie('0');
            unsetCookie('1');
            unsetCookie('2');
          })
        })
      })
      describe('when used as LSD.Array callback', function() {
        it ('should store array into cookies', function() {
          var array = new LSD.Array;
          array.watch(LSD.Storage.Cookies);
          array.push('of');
          expect(getCookie(0)).toBe('of');
          array.push('god');
          expect(getCookie(1)).toBe('god');
          array.unshift('songs');
          expect(getCookie(0)).toBe('songs');
          expect(getCookie(1)).toBe('of');
          expect(getCookie(2)).toBe('god');
          array.splice(0, 2);
          expect(getCookie(0)).toBe('god');
          expect(getCookie(1)).toBeUndefined()
          array.pop()
          expect(getCookie(0)).toBeUndefined()
        })
      })
      describe('when used as a functional mixin', function() {
        describe('with a forced context', function() {
          it ('should import and sync array values', function() {
            var array = new LSD.Array;
            setCookie(0, 'songs');
            setCookie(1, 'god')
            LSD.Storage.Cookies.call(array);
            expect(array[0]).toBe('songs');
            expect(array[1]).toBe('god');
            array.splice(1, 0, 'of')
            expect(getCookie(0)).toBe('songs');
            expect(getCookie(1)).toBe('of');
            expect(getCookie(2)).toBe('god');
            array.shift()
            expect(getCookie(0)).toBe('of');
            expect(getCookie(1)).toBe('god');
            expect(getCookie(2)).toBeUndefined()
            array.pop()
            expect(getCookie(0)).toBe('of');
            expect(getCookie(1)).toBeUndefined()
            array.pop()
            expect(getCookie(0)).toBeUndefined()
          })
        })
        describe('with context given as argument', function() {

          describe('and array already has a key that also setCookie in cookies', function() {
            it ('should overwrite old cookies with new values', function() {
              var array = new LSD.Array('songs');
              setCookie(0, 'dance');
              setCookie(1, 'god');
              LSD.Storage.Cookies(array);
              expect(array[0]).toBe('songs');
              expect(array[1]).toBe('god');
              expect(getCookie(0)).toBe('songs');
              expect(getCookie(1)).toBe('god');
              array.splice(1, 0, 'of')
              expect(array[0]).toBe('songs');
              expect(array[1]).toBe('of');
              expect(array[2]).toBe('god');
              expect(getCookie(0)).toBe('songs');
              expect(getCookie(1)).toBe('of');
              expect(getCookie(2)).toBe('god');
              array.splice(0, 3)
              expect(array[0]).toBeUndefined();
              expect(array[1]).toBeUndefined();
              expect(array[2]).toBeUndefined()
              expect(getCookie(0)).toBeUndefined();
              expect(getCookie(1)).toBeUndefined();
              expect(getCookie(2)).toBeUndefined();
            })
          })
        })
      })
    }
    // just in case something goes wrong
    unsetCookie('0', 'a')
    unsetCookie('1', 'a')
    unsetCookie('2', 'a')
  })
  describe('.Local', function() {
    setLocal('test', 'a');
    var local = getLocal('test');
    unsetLocal('test')
    if (!local) return;
    describe('when called with no arguments', function() {
      describe('with a forced context', function() {
        it ('should import locals into current context', function() {
          setLocal('0', '1');
          setLocal('1', '2');
          setLocal('length', 2);
          var storage = {};
          LSD.Storage.Local.call(storage);
          expect(storage[0]).toBe('1');
          expect(storage[1]).toBe('2');
          unsetLocal('0');
          unsetLocal('1');
        })
      })
      describe('with native array given as context', function() {
        it ('should import locals into given context', function() {
          setLocal('0', '1');
          setLocal('1', '2');
          setLocal('length', 2);
          var storage = [];
          LSD.Storage.Local.call(storage);
          expect(storage[0]).toBe('1');
          expect(storage[1]).toBe('2');
          expect(storage.length).toBe(2);
          unsetLocal('0');
          unsetLocal('1');
          unsetLocal('length');
        })
      })
      describe('with native object given as context', function() {
        it ('should import locals into given context', function() {
          setLocal('0', '1');
          setLocal('1', '2');
          setLocal('length', 2);
          var storage = {};
          LSD.Storage.Local.call(storage);
          expect(storage[0]).toBe('1');
          expect(storage[1]).toBe('2');
          unsetLocal('0');
          unsetLocal('1');
          unsetLocal('length');
        })
      })
      describe('with a callback given as a first argument', function() {
        it ('should invoke callbacks with returned values', function() {
          var args = [], i = 0;
          var callback = function(index, value, meta) {
            if (parseInt(index) == index) {
              args.push([index, value])
              i++;
            }
          }
          setLocal('1', '2');
          setLocal('0', '1');
          setLocal('length', 2);
          LSD.Storage.Local(callback);
          expect(i).toBe(2);
          expect(args).toEqual([['0', '1'], ['1', '2']])
          unsetLocal('0');
          unsetLocal('1');
          unsetLocal('length');
        })
      })
    });
    describe('when called with one argument', function() {
      describe('with a forced context', function() {
        it ('should import locals into current context and treat argument as prefix', function() {
          setLocal('0', '1', prefix);
          setLocal('1', '2', prefix);
          setLocal('length', 2, prefix);
          var storage = {};
          LSD.Storage.Local.call(storage, prefix);
          expect(storage[0]).toBe('1');
          expect(storage[1]).toBe('2');
          unsetLocal('0', prefix);
          unsetLocal('1', prefix);
          unsetLocal('length', prefix);
        })
      })
      describe('with no explicit context', function() {
        describe('with a key given as a first argument', function() {
          it ('should get locals', function() {
            setLocal('0', '1');
            setLocal('length', 1);
            expect(LSD.Storage.Local('0')).toBe('1');
            unsetLocal('0')
            unsetLocal('length');
          })
        })
        describe('with a callback given as a first argument', function() {
          it ('should invoke callback with found values and treat second argument as prefix', function() {
            var args = [], i = 0;
            var callback = function(index, value, meta) {
              args.push([index, value])
              i++;
            }
            setLocal('1', '2', prefix);
            setLocal('0', '1', prefix);
            setLocal('length', 2, prefix);
            LSD.Storage.Local(callback, prefix);
            expect(i).toBe(2);
            expect(args).toEqual([['0', '1'], ['1', '2']])
            unsetLocal('0', prefix);
            unsetLocal('1', prefix);
            unsetLocal('length', prefix);
          })
        })
        describe('with a context given as a first argument', function() {
          describe('with native array given as context', function() {
            it ('should import locals into given context', function() {
              setLocal('0', '1', prefix);
              setLocal('1', '2', prefix);
              setLocal('length', 2, prefix);
              var storage = [];
              LSD.Storage.Local(storage, prefix);
              expect(storage[0]).toBe('1');
              expect(storage[1]).toBe('2');
              expect(storage.length).toBe(2);
              unsetLocal('0', prefix);
              unsetLocal('1', prefix);
              unsetLocal('length', prefix);
            })
          })
          describe('with native object given as context', function() {
            it ('should import locals into given context', function() {
              setLocal('0', '1', prefix);
              setLocal('1', '2', prefix);
              setLocal('length', 2, prefix);
              var storage = {};
              LSD.Storage.Local(storage, prefix);
              expect(storage[0]).toBe('1');
              expect(storage[1]).toBe('2');
              unsetLocal('0', prefix);
              unsetLocal('1', prefix);
              unsetLocal('length', prefix);
            })
          })
          describe('with LSD.Array given as context', function() {
            it ('should import and sync array values', function() {
              var array = new LSD.Array;
              setLocal(0, 'songs');
              setLocal(1, 'god')
              setLocal('length', 2);
              LSD.Storage.Local(array);
              expect(array[0]).toBe('songs');
              expect(array[1]).toBe('god');
              array.splice(1, 0, 'of')
              expect(getLocal(0)).toBe('songs');
              expect(getLocal(1)).toBe('of');
              expect(getLocal(2)).toBe('god');
              array.shift()
              expect(getLocal(0)).toBe('of');
              expect(getLocal(1)).toBe('god');
              expect(getLocal(2)).toBeUndefined() 
              array.pop()
              expect(getLocal(0)).toBe('of');
              expect(getLocal(1)).toBeUndefined()
              array.pop()
              expect(getLocal(0)).toBeUndefined()
            })
          })
        })
      })
    })
    describe('when called with two arguments', function() {
      describe('with a key value pair', function() {
        it ('should set and unset locals', function() {
          expect(getLocal('0')).toBeUndefined()
          LSD.Storage.Local('secret', '0')
          expect(getLocal('0')).toBe('secret')
          LSD.Storage.Local(undefined, '0')
          expect(getLocal('0')).toBeUndefined();
        });
      })
      describe('with a key and a callback', function() {
        it ('should execute a callback with a value of by the given key', function() {
          setLocal('0', '1');
          var args, callback = function(key, value) {
            args = [key, value]
          }
          expect(LSD.Storage.Local('0', callback)).toBe('1');
          expect(args).toEqual(['0', '1'])
          unsetLocal('0', '1');
        })
      })
      describe('with a context given as a first argument', function() {
        it ('should import locals into current context', function() {
          setLocal('0', '1', prefix);
          setLocal('1', '2', prefix);
          setLocal('length', 2, prefix);
          var storage = {};
          LSD.Storage.Local(storage, prefix);
          expect(storage[0]).toBe('1');
          expect(storage[1]).toBe('2');
          unsetLocal('0', prefix);
          unsetLocal('1', prefix);
          unsetLocal('length', prefix);
        })
      })
      describe('with a callback given as a first argument', function() {
        it ('should invoke callback with found values and treat second argument as prefix', function() {
          var args = [], i = 0;
          var callback = function(index, value, meta) {
            args.push([index, value])
            i++;
          }
          setLocal('1', '2', prefix);
          setLocal('0', '1', prefix);
          setLocal('length', 2, prefix);
          LSD.Storage.Local(callback, prefix);
          expect(i).toBe(2);
          expect(args).toEqual([['0', '1'], ['1', '2']])
          unsetLocal('0', prefix);
          unsetLocal('1', prefix);
          unsetLocal('length', prefix);
        })
      })
    });
    describe('when called with three arguments', function() {
      describe('with a key value pair', function() {
        describe('and a callback', function() {
          it ('should set and unset values and invoke the callback', function() {
            var args, callback = function(key, value) {
              args = [key, value]
            }
            LSD.Storage.Local('1', '0', callback);
            expect(getLocal(0)).toBe('1')
            expect(args).toEqual(['0', '1'])
            expect(LSD.Storage.Local(undefined, '0', callback)).toBe(undefined);
            expect(args).toEqual(['0', undefined])
            expect(getLocal(0)).toBeUndefined()
          })
        })
        describe('and a prefix', function() {
          it ('should set and unset values and invoke the callback', function() {
            LSD.Storage.Local('1', '0', prefix);
            expect(getLocal(0, prefix)).toBe('1')
            expect(LSD.Storage.Local(undefined, '0', prefix)).toBe(undefined);
            expect(getLocal(0, prefix)).toBeUndefined()
          })
        })
      })
    })
    describe('when called with four arguments', function() {
      describe('with a key value pair', function() {
        describe('and prefix', function() {
          describe('and callback', function() {
            it ('should set and unset values and invoke the callback', function() {
              var args, callback = function(key, value) {
                args = [key, value]
              }
              LSD.Storage.Local('1', '0', prefix, callback);
              expect(getLocal(0, prefix)).toBe('1')
              expect(args).toEqual(['0', '1'])
              LSD.Storage.Local(undefined, '0', prefix, callback);
              expect(args).toEqual(['0', undefined])
              expect(getLocal(0, prefix)).toBeUndefined()
            })
          })
          describe('and native array given as context', function() {
            it ('should set a value by that key in that context', function() {
              var storage = [];
              LSD.Storage.Local('1', '0', prefix, storage);
              expect(storage[0]).toBe('1');
              expect(storage.length).toBe(1);
              unsetLocal('0', prefix);
              LSD.Storage.Local(undefined, '0', prefix, storage);
              expect(storage[0]).toBeUndefined()
              expect(storage.length).toBe(0);
            })
          })
          describe('and native object given as context', function() {
            it ('should set a value by that key in that context', function() {
              var storage = {};
              LSD.Storage.Local('1', '0', prefix, storage);
              expect(storage[0]).toBe('1');
              expect(storage.length).toBeUndefined();
              unsetLocal('0', prefix);
              LSD.Storage.Local(undefined, '0', prefix, storage);
              expect(storage[0]).toBeUndefined()
              expect(storage.length).toBeUndefined();
            })
          })
        })
      })
    })
    describe('when used as an iterator', function() {
      describe('with LSD.array', function() {
        it ('should store values from array', function() {
          var array = LSD.Array(1,2,3);
          array.forEach(LSD.Storage.Local);
          expect(getLocal(0)).toBe('1');
          expect(getLocal(1)).toBe('2');
          expect(getLocal(2)).toBe('3');
          unsetLocal('0');
          unsetLocal('1');
          unsetLocal('2');
        })
      })
      describe('with sparse LSD.Array', function() {
        it ('should store values from array', function() {
          var array = LSD.Array(1)
          array.set(2, 3)
          array.forEach(LSD.Storage.Local);
          expect(getLocal(0)).toBe('1');
          expect(getLocal(1)).toBeUndefined()
          expect(getLocal(2)).toBe('3');
          unsetLocal('0');
          unsetLocal('1');
          unsetLocal('2');
        })
      })
      describe('with native array', function() {
        it ('should store values from array', function() {
          var array = [1,2,3];
          array.forEach(LSD.Storage.Local);
          expect(getLocal(0)).toBe('1');
          expect(getLocal(1)).toBe('2');
          expect(getLocal(2)).toBe('3');
          unsetLocal('0');
          unsetLocal('1');
          unsetLocal('2');
        })
      })
      describe('with sparse native array', function() {
        it ('should store values from array', function() {
          var array = [1]
          array[2] = 3;
          array.forEach(LSD.Storage.Local);
          expect(getLocal(0)).toBe('1');
          expect(getLocal(1)).toBeUndefined()
          expect(getLocal(2)).toBe('3');
          unsetLocal('0');
          unsetLocal('1');
          unsetLocal('2');
        })
      })
    })
    describe('when used as LSD.Array callback', function() {
      it ('should store array into locals', function() {
        var array = new LSD.Array;
        array.watch(LSD.Storage.Local);
        array.push('of');
        expect(getLocal(0)).toBe('of');
        array.push('god');
        expect(getLocal(1)).toBe('god');
        array.unshift('songs');
        expect(getLocal(0)).toBe('songs');
        expect(getLocal(1)).toBe('of');
        expect(getLocal(2)).toBe('god');
        array.splice(0, 2);
        expect(getLocal(0)).toBe('god');
        expect(getLocal(1)).toBeUndefined()
        array.pop()
        expect(getLocal(0)).toBeUndefined()
      })
    })
    describe('when used as a functional mixin', function() {
      describe('with a forced context', function() {
        it ('should import and sync array values', function() {
          var array = new LSD.Array;
          setLocal(0, 'songs');
          setLocal(1, 'god')
          setLocal('length', 2)
          LSD.Storage.Local.call(array);
          expect(array[0]).toBe('songs');
          expect(array[1]).toBe('god');
          array.splice(1, 0, 'of')
          expect(getLocal(0)).toBe('songs');
          expect(getLocal(1)).toBe('of');
          expect(getLocal(2)).toBe('god');
          array.shift()
          expect(getLocal(0)).toBe('of');
          expect(getLocal(1)).toBe('god');
          expect(getLocal(2)).toBeUndefined()
          array.pop()
          expect(getLocal(0)).toBe('of');
          expect(getLocal(1)).toBeUndefined()
          array.pop()
          expect(getLocal(0)).toBeUndefined()
          unsetLocal('length');
        })
      })
      describe('with context given as argument', function() {
        describe('and array already has a key that also setLocal in locals', function() {
          it ('should overwrite old locals with new values', function() {
            var array = new LSD.Array('songs');
            setLocal(0, 'dance');
            setLocal(1, 'god');
            setLocal('length', 2)
            LSD.Storage.Local(array);
            expect(array[0]).toBe('songs');
            expect(array[1]).toBe('god');
            expect(getLocal(0)).toBe('songs');
            expect(getLocal(1)).toBe('god');
            array.splice(1, 0, 'of')
            expect(array[0]).toBe('songs');
            expect(array[1]).toBe('of');
            expect(array[2]).toBe('god');
            expect(getLocal(0)).toBe('songs');
            expect(getLocal(1)).toBe('of');
            expect(getLocal(2)).toBe('god');
            array.splice(0, 3)
            expect(array[0]).toBeUndefined();
            expect(array[1]).toBeUndefined();
            expect(array[2]).toBeUndefined()
            expect(getLocal(0)).toBeUndefined();
            expect(getLocal(1)).toBeUndefined();
            expect(getLocal(2)).toBeUndefined();
            unsetLocal('length');
          })
        })
      })
    })
    // just in case something goes wrong
    unsetLocal('0')
    unsetLocal('1')
    unsetLocal('2')
    unsetLocal('length')
  })
  if (LSD.Storage.Indexed.prototype.storage) describe('Indexed', function() {
    describe('open', function() {
      it ('should open database invoke callback with a db reference', function() {
        var called;
        var storage = new LSD.Storage.Indexed;
        storage.open(prefix, function(database) {
          called = database;
        });
        waitsFor(function() {
          return called;
        }, 'an open database callback', 100);
        runs(function() {
          expect(called).toBeTruthy();
          expect(called.name).toBe(prefix);
        })
      })
    });
    
    describe('openStore', function() {
      it ('should open a new transaction and invoke callback with a db store object', function() {
        var called;
        var storage = new LSD.Storage.Indexed;
        storage.openStore(prefix, function(store) {
          called = store;
        });
        waitsFor(function() {
          return called;
        }, 'an open store callback', 100);
        runs(function() {
          expect(called).toBeTruthy();
          expect(called.name).toBe(prefix);
        })
      })
    })
    
    
    describe('openCursor', function() {
      it ('should open a new transaction and invoke callback with a db store object', function() {
        var called;
        var storage = new LSD.Storage.Indexed
        storage.openCursor(prefix, function(store) {
          called = arguments;
        });
        waitsFor(function() {
          return called;
        }, 'an open cursor callback', 100);
        runs(function() {
          expect(called[1].type).toBe('success');
          expect(called[0]).toBeFalsy()
        })
      })
    })
    
    describe('when called with two arguments', function() {
      describe('with a key value pair', function() {
        it ('should add, get and unset values', function() {
          var calls = [], callback = function() {
            calls.push(Array.prototype.slice.call(arguments));
          }
          LSD.Storage.Indexed('secret', '0', prefix, callback)
          waitsFor(function() {
            return calls.length;
          }, 'an put callback', 100);
          runs(function() {
            var call = calls.pop();
            expect(call[0]).toEqual('0');
            expect(call[1]).toEqual('secret');
            expect(call[2].type).toEqual('success');
            LSD.Storage.Indexed.prototype.getItem('0', prefix, callback);
          })
          waitsFor(function() {
            return calls.length;
          }, 'an get callback', 100);
          runs(function() {
            var call = calls.pop();
            expect(call[0]).toEqual('0');
            expect(call[1]).toEqual('secret');
            expect(call[2].type).toEqual('success');
            LSD.Storage.Indexed.prototype.getAllItems(prefix, callback);
          })
          waitsFor(function() {
            return calls.length;
          }, 'a cursor callback', 100);
          runs(function() {
            var call = calls.pop();
            expect(call[0]).toEqual('0');
            expect(call[1]).toEqual('secret');
            expect(call[2].type).toEqual('success');
            LSD.Storage.Indexed('mistery', '1', prefix, callback)
          })
          waitsFor(function() {
            return calls.length;
          }, 'an put callback', 100);
          runs(function() {
            var call = calls.pop();
            expect(call[0]).toEqual('1');
            expect(call[1]).toEqual('mistery');
            expect(call[2].type).toEqual('success');
            LSD.Storage.Indexed(undefined, '0', prefix, callback);
          })
          waitsFor(function() {
            return calls.length;
          }, 'a delete callback', 100);
          runs(function() {
            var call = calls.pop();
            expect(call[0]).toEqual('0');
            expect(call[1]).toBeUndefined()
            expect(call[2].type).toEqual('success');
            LSD.Storage.Indexed.prototype.getItem('0', prefix, callback);
          })
          waitsFor(function() {
            return calls.length;
          }, 'an get callback', 100);
          runs(function() {
            var call = calls.pop();
            expect(call[0]).toEqual('0');
            expect(call[1]).toBeUndefined()
            expect(call[2].type).toEqual('success');
            LSD.Storage.Indexed(undefined, '1', prefix, callback);
          })
          waitsFor(function() {
            return calls.length;
          }, 'a delete callback', 100);
          runs(function() {
            var call = calls.pop();
            expect(call[0]).toEqual('1');
            expect(call[1]).toBeUndefined()
            expect(call[2].type).toEqual('success');
            LSD.Storage.Indexed.prototype.getItem('1', prefix, callback);
          })
          waitsFor(function() {
            return calls.length;
          }, 'an get callback', 100);
          runs(function() {
            var call = calls.pop();
            expect(call[0]).toEqual('1');
            expect(call[1]).toBeUndefined()
            expect(call[2].type).toEqual('success');
          })
        });
      })
      xdescribe('with a key and a callback', function() {
        it ('should execute a callback with a value of by the given key', function() {
          setCookie('0', '1');
          var args, callback = function(key, value) {
            args = [key, value]
          }
          expect(LSD.Storage.Cookies('0', callback)).toBe('1');
          expect(args).toEqual(['0', '1'])
          unsetCookie('0', '1');
        })
      })
      xdescribe('with a context given as a first argument', function() {
        it ('should import cookies into current context', function() {
          setCookie('0', '1', prefix);
          setCookie('1', '2', prefix);
          var storage = {};
          LSD.Storage.Cookies(storage, prefix);
          expect(storage[0]).toBe('1');
          expect(storage[1]).toBe('2');
          unsetCookie('0', prefix);
          unsetCookie('1', prefix);
        })
      })
      xdescribe('with a callback given as a first argument', function() {
        it ('should invoke callback with found values and treat second argument as prefix', function() {
          var args = [], i = 0;
          var callback = function(index, value, meta) {
            args.push([index, value])
            i++;
          }
          setCookie('1', '2', prefix);
          setCookie('0', '1', prefix);
          LSD.Storage.Cookies(callback, prefix);
          expect(i).toBe(2);
          expect(args).toEqual([['0', '1'], ['1', '2']])
          unsetCookie('0', prefix);
          unsetCookie('1', prefix);
        })
      })
    });
  })
})