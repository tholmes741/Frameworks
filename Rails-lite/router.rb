class Route
  attr_reader :pattern, :http_method, :controller_class, :action_name

  def initialize(pattern, http_method, controller_class, action_name)
    @pattern = pattern
    @http_method = http_method
    @controller_class = controller_class
    @action_name = action_name
  end

  def matches?(req)
    @pattern =~ req.path && (@http_method.to_s == req.request_method.downcase)
  end

  def run(req, res)
    match_data = @pattern.match(req.path)
    route_params = {}
    match_data.names.each { |name| route_params[name] = match_data[name]}
    controller_class.new(req, res, route_params).invoke_action(action_name)
  end
end

class Router
  attr_reader :routes

  def initialize
    @routes = []
  end

  def add_route(pattern, method, controller_class, action_name)
    @routes << Route.new(pattern, method, controller_class, action_name)
  end

  def draw(&proc)
    instance_eval(&proc)
  end

  [:get, :post, :put, :delete].each do |http_method|
    define_method(http_method) do |pattern, controller_class, action_name|
       add_route(pattern, http_method, controller_class, action_name)
     end
  end

  def match(req)
    @routes.find { |route| route.matches?(req) }
  end

  def run(req, res)
    if match(req)
      match(req).run(req, res)
    else
      res.status = 404
      res.body = ["There was no matching route"]
    end
  end
end
