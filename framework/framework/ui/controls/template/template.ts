module plat.ui.controls {
    export class Template extends TemplateControl {
        $Promise: async.IPromise = acquire('$Promise');
        $TemplateCache: storage.ITemplateCache = acquire('$TemplateCache');
        $ExceptionStatic: IExceptionStatic = acquire('$ExceptionStatic');
        $Document: Document = acquire('$Document');

        /**
         * Removes the <plat-template> node from the DOM
         */
        replaceWith: string = null;

        /**
         * The evaluated plat-options object.
         */
        options: observable.IObservableProperty<ITemplateOptions>;

        /**
         * The unique ID used to reference a particular 
         * template.
         */
        _id: string;

        /**
         * The optional URL associated with this 
         * particular template.
         */
        _url: string;
        private __isFirst: boolean = false;
        private __templatePromise: async.IThenable<Template>;
        private __templateControlCache: storage.ICache<any>;
        constructor() {
            super();
            var $cacheFactory: storage.ICacheFactory = acquire('$CacheFactory');
            this.__templateControlCache = $cacheFactory.create<any>('__templateControlCache');
        }

        /**
         * Initializes the creation of the template.
         */
        initialize(): void {
            var templateControlCache = this.__templateControlCache,
                id = this._id = this.options.value.id,
                options = this.options.value;

            if (isNull(id)) {
                return;
            }

            this._url = options.url;

            var templatePromise: async.IThenable<Template> = this.__templateControlCache.read(id);
            if (!isNull(templatePromise)) {
                this.__templatePromise = templatePromise;
                return;
            }

            this.__isFirst = true;
            this._initializeTemplate();
        }

        /**
         * Decides if this is a template definition or 
         * a template instance.
         */
        loaded(): void {
            if (!this.__isFirst) {
                this._waitForTemplateControl(this.__templatePromise);
            }
        }

        /**
         * Removes the template from the template cache.
         */
        dispose(): void {
            if (this.__isFirst) {
                this.__templateControlCache.dispose();
            }
        }

        /**
         * Determines whether a URL or innerHTML is being used, 
         * creates the bindable template, and stores the template 
         * in a template cache for later use.
         */
        _initializeTemplate(): void {
            var id = this._id;

            if (isNull(id)) {
                return;
            }

            var parentNode = this.endNode.parentNode,
                url = this._url,
                template: any;

            if (!isNull(url)) {
                template = this.$TemplateCache.read(url);
                //determineTemplate sets the templateUrl so we need to reset it back to null
                this.templateUrl = null;
                this.dom.clearNodeBlock(this.elementNodes, parentNode);
            } else {
                template = this.$Document.createDocumentFragment();
                this.dom.appendChildren(this.elementNodes, template);
            }

            var controlPromise: async.IThenable<ITemplateControl>;
            if (isFunction(template.then)) {
                controlPromise = template.catch((error: Error) => {
                    if (isNull(error)) {
                        return TemplateControl.determineTemplate(this, url);
                    }
                }).then((template: DocumentFragment) => {
                    var bindableTemplates = this.bindableTemplates;
                    bindableTemplates.add(id, template.cloneNode(true));
                    return this;
                });
            } else {
                this.bindableTemplates.add(id, template.cloneNode(true));

                controlPromise = this.$Promise.resolve(this);
            }

            this.__templateControlCache.put(id, controlPromise);
        }

        /**
         * Waits for the template promise to resolve, then initializes 
         * the binding of the bindable template and places it into the 
         * DOM.
         * 
         * @param templatePromise The promise associated with the first 
         * instance of the template with this ID.
         */
        _waitForTemplateControl(templatePromise: async.IThenable<Template>): void {
            templatePromise.then((templateControl: Template) => {
                if (!(isNull(this._url) || (this._url === templateControl._url))) {
                    this.$ExceptionStatic.warn('The specified url: ' + this._url +
                        ' does not match the original plat-template with id: ' +
                        '"' + this._id + '". The original url will be loaded.',
                        this.$ExceptionStatic.TEMPLATE);
                }

                this.__mapBindableTemplates(templateControl);

                var endNode = this.endNode;
                this._instantiateTemplate().then((clone) => {
                    this.dom.insertBefore(endNode.parentNode, clone, endNode);
                });
            }).catch((error) => {
                postpone(() => {
                    this.$ExceptionStatic.warn('Problem resolving plat-template url: ' +
                        error.response, this.$ExceptionStatic.TEMPLATE);
                });
            });
        }

        /**
         * Binds the template to the proper context and 
         * resolves the clone to be placed into the DOM.
         */
        _instantiateTemplate(): async.IThenable<DocumentFragment> {
            var bindableTemplates = this.bindableTemplates,
                id = this._id;

            return new this.$Promise<DocumentFragment>((resolve, reject) => {
                bindableTemplates.bind(id, (clone: DocumentFragment) => {
                    resolve(clone);
                });
            });
        }

        private __mapBindableTemplates(control: Template): void {
            (<BindableTemplates>this.bindableTemplates)._cache =
                (<BindableTemplates>control.bindableTemplates)._cache;
            this.bindableTemplates.templates = control.bindableTemplates.templates;
        }
    }

    /**
     * The available options for plat.ui.controls.Template.
     */
    export interface ITemplateOptions {
        /**
         * The unique ID used to label a template 
         * and use it as DOM.
         */
        id: string;

        /**
         * An optional URL to specify a template 
         * instead of using the element's innerHTML.
         */
        url: string;
    }

    register.control('plat-template', Template);
}
