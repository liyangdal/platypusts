module plat.storage {
    /**
     * Used for caching compiled nodes. This class will
     * clone a template when you put it in the cache. It will
     * also clone the template when you retrieve it.
     */
    class TemplateCache extends Cache<any> implements ITemplateCache {
        $ExceptionStatic: IExceptionStatic = acquire('$ExceptionStatic');
        $Promise: async.IPromiseStatic = acquire('$PromiseStatic');
        constructor() {
            super('__templateCache');
        }

        /**
         * Stores a Node in the cache as a DocumentFragment.
         * 
         * @param key The key used to store the value.
         * @param value The Node.
         */
        put(key: string, value: Node): async.IPromise<DocumentFragment, any>;
        /**
         * Stores a Promise in the cache.
         * 
         * @param key The key used to store the value.
         * @param value The Promise.
         */
        put(key: string, value: async.IPromise<Node, any>): async.IPromise<DocumentFragment, any>;
        put(key: string, value: any): async.IPromise<DocumentFragment, any> {
            super.put(key, this.$Promise.resolve<DocumentFragment>(value));

            if (isDocumentFragment(value)) {
                value = value.cloneNode(true);
            } else if (isNode(value)) {
                var fragment = document.createDocumentFragment();
                fragment.appendChild(value.cloneNode(true));
                value = fragment;
            }
            
            return this.$Promise.resolve<DocumentFragment>(value);
        }

        /**
         * Method for retrieving a Node from a TemplateCache. If a Node 
         * is found in the cache, it will be cloned.
         * 
         * @param key The key to search for in a TemplateCache.
         * 
         * @return {T|async.IPromise<T, Error>} The value found at the associated key. 
         * Returns null for an ITemplateCache miss.
         */
        read(key: string): async.IPromise<DocumentFragment, any>{
            var promise: async.IPromise<DocumentFragment, any> = super.read(key);

            if (isNull(promise)) {
                return <any>this.$Promise.reject(null);
            }

            return promise.then((node: Node) => {
                return this.put(key, node);
            }).catch((error) => {
                this.$ExceptionStatic.warn('Error retrieving template from promise.', this.$ExceptionStatic.TEMPLATE);
            });
        }
    }

    register.injectable('$templateCache', TemplateCache);

    /**
     * Interface for TemplateCache, used to manage all templates. Returns a unique template 
     * for every read, to avoid having to call cloneNode.
     */
    export interface ITemplateCache extends ICache<async.IPromise<DocumentFragment, Error>> {
        /**
         * Stores a Node in the cache as a DocumentFragment.
         * 
         * @param key The key used to store the value.
         * @param value The Node.
         */
        put(key: string, value: Node): async.IPromise<DocumentFragment, any>;
        /**
         * Stores a Promise in the cache.
         * 
         * @param key The key used to store the value.
         * @param value The Promise.
         */
        put(key: string, value: async.IPromise<Node, any>): async.IPromise<DocumentFragment, any>;

        /**
         * Method for retrieving a Node from an ITemplateCache. The returned DocumentFragment will be 
         * cloned to avoid manipulating the cached template. 
         * 
         * @param key The key to search for in an ITemplateCache.
         */
        read(key: string): async.IPromise<DocumentFragment, any>;
    }
}
